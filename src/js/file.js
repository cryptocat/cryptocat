'use strict';
Cryptocat.File = {};

(function() {
	Cryptocat.File.maxSize   = 51000000;
	Cryptocat.File.chunkSize = 25000;
	Cryptocat.File.types  = {
		archive: [
			'7z', '7zx', 'bin',
			'bz2', 'db', 'gz',
			'iso', 'rar', 'sql',
			'tar', 'zip', 'zipx'
		],
		audio: [
			'aif', 'mid', 'wma'
		],
		code: [
			'c', 'cc', 'class',
			'cpp', 'cs', 'go',
			'h', 'hs', 'java',
			'lhs', 'm', 'ml',
			'pl', 'py', 'rb',
			'rs', 'swift'
		],
		document: [
			'ai', 'aut', 'cad',
			'csv', 'doc', 'docx',
			'eps', 'markdown', 'md',
			'odt', 'pdf', 'ppt',
			'pptx', 'ps', 'psd',
			'rtf', 'torrent', 'txt',
			'xls', 'xlsx'
		],
		image: [
			'bmp', 'gif', 'jpg',
			'jpeg', 'png', 'webp'
		],
		recording: [
			'aac', 'gifv', 'm4a',
			'mp3', 'mp4', 'ogg',
			'wav', 'webm'
		],
		video: [
			'3gp', 'avi', 'flv',
			'm4v', 'mkv', 'mov',
			'mpeg', 'mpg', 'mpg',
			'wmv'
		]
	};

	var fileCrypto = {
		encrypt: function(k, iv, m) {
			var aes = NodeCrypto.createCipheriv(
				'aes-256-gcm',
				new Buffer(k),
				new Buffer(iv)
			);
			var res = {
				ciphertext: new Buffer([]),
				tag: ''
			};
			aes.setAAD(new Buffer('Cryptocat', 'utf8'));
			res.ciphertext = aes.update(m);
			res.ciphertext = Buffer.concat([res.ciphertext, aes.final()]);
			res.tag        = aes.getAuthTag().toString('hex');
			return res;
		},
		decrypt: function(k, iv, m) {
			var aes = NodeCrypto.createDecipheriv(
				'aes-256-gcm',
				new Buffer(k,  'hex'),
				new Buffer(iv, 'hex')
			);
			aes.setAAD(new Buffer('Cryptocat', 'utf8'));
			aes.setAuthTag(new Buffer(m.tag, 'hex'));
			var res = aes.update(m.ciphertext);
			try {
				res = Buffer.concat([res, aes.final()]);
				return {
					plaintext: res,
					valid:     true
				};
			} catch (e) {
				return {
					plaintext: new Buffer([]),
					valid:     false
				};
			}
		}
	};

	var putFile = function(file, onProgress, onEnd) {
		var put = HTTPS.request({
			hostname: 'cryptocat.blob.core.windows.net',
			port: 443,
			method: 'PUT',
			path: '/files/' + file.sas,
			headers: {
				'X-Ms-Blob-Type': 'BlockBlob',
				'Content-Type':   'application/octet-stream',
				'Content-Length': file.encrypted.ciphertext.length
			},
			agent: false
		}, function(res) {
			console.info(res.statusCode);
			onEnd({
				name:  file.name,
				url:   file.sas.substring(0, 128),
				key:   (new Buffer(file.key)).toString('hex'),
				iv:    (new Buffer(file.iv)).toString('hex'),
				tag:   file.encrypted.tag,
				valid: (res.statusCode === 201)
			}, file.file);
		});
		var putChunk = function(offset) {
			var nOffset = offset + Cryptocat.File.chunkSize;
			var chunk = file.encrypted.ciphertext.slice(offset, nOffset);
			if (nOffset < file.encrypted.ciphertext.length) {
				put.write(chunk, function() {
					onProgress(file.sas.substring(0, 128), Math.ceil(
						(nOffset * 100) / file.encrypted.ciphertext.length
					));
					putChunk(nOffset);
				});
			} else {
				put.end(chunk);
			}
		};
		put.flushHeaders();
		put.setTimeout(3000, function() {
			put.abort();
			putFile(file, onProgress, onEnd);
		});
		putChunk(0);
	};

	Cryptocat.File.getType = function(name) {
		var lName = name.toLowerCase();
		if (!(/\.\w{1,5}$/).test(lName)) {
			return {
				allowed: false,
				type: '',
				ext: ''
			};
		}
		var ext = lName.match(/\.\w{1,5}$/)[0].substr(1);
		for (var type in Cryptocat.File.types) {
			if (
				(hasProperty(Cryptocat.File.types, type)) &&
				(Cryptocat.File.types[type].indexOf(ext) >= 0)
			) {
				return {
					allowed: true,
					type: type,
					ext: ext
				};
			}
		}
		return {
			allowed: false,
			type: '',
			ext: ''
		};
	};

	Cryptocat.File.parseInfo = function(infoString) {
		var parsed = {};
		try {
			parsed = JSON.parse(infoString.substr(14));
		} catch (e) {
			return {
				name:  '',
				type:  '',
				ext:   '',
				url:   '',
				key:   '',
				iv:    '',
				tag:   '',
				valid: false
			};
		}
		var fileType = Cryptocat.File.getType(parsed.name);
		if (
			hasProperty(parsed, 'name')  &&
			hasProperty(parsed, 'url')   &&
			hasProperty(parsed, 'key')   &&
			hasProperty(parsed, 'iv')    &&
			hasProperty(parsed, 'tag')   &&
			hasProperty(parsed, 'valid') &&
			!(/(\/|\\|\~)/).test(parsed.name) &&
			Cryptocat.Patterns.hex64.test(parsed.url) &&
			Cryptocat.Patterns.hex32.test(parsed.key) &&
			Cryptocat.Patterns.hex12.test(parsed.iv)  &&
			Cryptocat.Patterns.hex16.test(parsed.tag) &&
			fileType.allowed &&
			(parsed.valid === true)
		) {
			return {
				name:  parsed.name,
				type:  fileType.type,
				ext:   fileType.ext,
				url:   parsed.url,
				key:   parsed.key,
				iv:    parsed.iv,
				tag:   parsed.tag,
				valid: parsed.valid
			};
		}
		return {
			name:  '',
			type:  '',
			ext:   '',
			url:   '',
			key:   '',
			iv:    '',
			tag:   '',
			valid: false
		};
	};

	Cryptocat.File.receive = function(info, onProgress, onEnd) {
		var saveFile = function(res) {
			res.setEncoding('binary');
			var total = parseInt(res.headers['content-length'], 10);
			var encrypted = '';
			res.on('data', function(chunk) {
				encrypted += chunk;
				onProgress(info.url, Math.ceil(
					(encrypted.length * 100) / total
				));
			});
			res.on('end', function() {
				var file = fileCrypto.decrypt(info.key, info.iv, {
					ciphertext: new Buffer(encrypted, 'binary'),
					tag: info.tag
				});
				if (!file.valid) {
					onEnd(info.url, new Buffer([]), false);
					return false;
				}
				onEnd(info.url, file.plaintext, true);
			});
		};
		HTTPS.get(
			'https://cryptocat.blob.core.windows.net/files/' + info.url,
			saveFile
		);
	};

	Cryptocat.File.send = function(
		name, file, onBegin, onProgress, onEnd
	) {
		if (!Cryptocat.File.getType(name).allowed) {
			Cryptocat.Diag.error.fileExt(name);
			return false;
		}
		if (file.length > Cryptocat.File.maxSize) {
			Cryptocat.Diag.error.fileMaxSize(name);
			onBegin({
				name:  name,
				url:   '',
				key:   '',
				iv:    '',
				tag:   '',
				valid: false
			});
			return false;
		}
		HTTPS.get('https://crypto.cat/sas', function(res) {
			var sas = '';
			res.on('data', function(chunk) {
				sas += chunk;
			});
			res.on('end', function() {
				if (!Cryptocat.Patterns.fileSas.test(sas)) {
					Cryptocat.Diag.error.fileGeneral(name);
					onBegin({
						name:  name,
						url:   '',
						key:   '',
						iv:    '',
						tag:   '',
						valid: false
					});
					return false;
				}
				var key = new Uint8Array(32);
				var iv  = new Uint8Array(12);
				window.crypto.getRandomValues(key);
				window.crypto.getRandomValues(iv);
				var encrypted = fileCrypto.encrypt(
					key, iv, file
				);
				putFile({
					name: name,
					sas: sas,
					file: file,
					key: key,
					iv: iv,
					encrypted: encrypted
				}, onProgress, onEnd);
				onBegin({
					name:  name,
					url:   sas.substring(0, 128),
					key:   (new Buffer(key)).toString('hex'),
					iv:    (new Buffer(iv)).toString('hex'),
					tag:   encrypted.tag,
					valid: true
				});
			});
		});
	};
})();
