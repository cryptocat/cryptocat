Cryptocat.File = {};

(function() {
	'use strict';

	Cryptocat.File.maxSize   = 51000000;
	Cryptocat.File.chunkSize = 25000;

	Cryptocat.File.allowed = [
		'7z',   'aac',  'ai',  'aut',
		'avi',  'bin',  'bmp', 'bz2',
		'cad',  'csv',  'db',  'doc',
		'docx', 'eps',  'flv', 'gif',
		'iso',  'java', 'jpg', 'jpeg',
		'mkv',  'mov',  'mp3', 'mp4', 
		'mpeg', 'mpg',  'pdf', 'png',
		'ppt',  'psd',  'ps',  'rar',
		'rtf',  'sql',  'svg', 'tar',
		'txt',  'wma',  'xls', 'xlsx',
		'zip'
	];

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
			} catch(e) {
				return {
					plaintext: new Buffer([]),
					valid:     false
				};
			};
		}
	};

	Cryptocat.File.isAllowed = function(name) {
		if (
			(/\.\w{1,5}$/).test(name) &&
			(Cryptocat.File.allowed.indexOf(
				name.match(/\.\w{1,5}$/)[0].substr(1)
			) >= 0)
		) {
			return true;
		}
		return false;
	};

	Cryptocat.File.parseInfo = function(infoString) {
		var parsed = {};
		try {
			parsed = JSON.parse(infoString.substr(14));
		} catch(e) {
			return {
				name:  '',
				type:  '',
				url:   '',
				key:   '',
				iv:    '',
				tag:   '',
				valid: false
			};
		};
		if (
			hasProperty(parsed, 'name')  &&
			hasProperty(parsed, 'url')   &&
			hasProperty(parsed, 'key')   &&
			hasProperty(parsed, 'iv')    &&
			hasProperty(parsed, 'tag')   &&
			hasProperty(parsed, 'valid') &&
			!(/(\/|\\|\~)/).test(parsed.name)     &&
			Cryptocat.File.isAllowed(parsed.name) &&
			Cryptocat.Patterns.hex64.test(parsed.url) &&
			Cryptocat.Patterns.hex32.test(parsed.key) &&
			Cryptocat.Patterns.hex12.test(parsed.iv)  &&
			Cryptocat.Patterns.hex16.test(parsed.tag) &&
			(parsed.valid === true)
		) {
			return {
				name:  parsed.name,
				type:  parsed.name.match(/\.\w{1,5}$/)[0].substr(1),
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
		path, onBegin, onProgress, onEnd
	) {
		var name = (require('path')).basename(path);
		if (!Cryptocat.File.isAllowed(name)) {
			Cryptocat.Diag.error.fileExt();
			return false;
		}
		FS.readFile(path, function(err, file) {
			if (err) {
				Cryptocat.Diag.error.fileGeneral();
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
			if (file.length > Cryptocat.File.maxSize) {
				Cryptocat.Diag.error.fileMaxSize();
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
						Cryptocat.Diag.error.fileGeneral();
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
					putFile(
						name, sas, file, key, iv, encrypted,
						onProgress, onEnd
					);
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
		});
	};

	var putFile = function(
		name, sas, file, key, iv, encrypted,
		onProgress, onEnd
	) {
		var put = HTTPS.request({
			hostname: 'cryptocat.blob.core.windows.net',
			port: 443,
			method: 'PUT',
			path: '/files/' + sas,
			headers: {
				'X-Ms-Blob-Type': 'BlockBlob',
				'Content-Type':   'application/octet-stream',
				'Content-Length': encrypted.ciphertext.length
			},
			agent: false
		}, function(res) {
			console.info(res.statusCode);
			onEnd({
				name:  name,
				url:   sas.substring(0, 128),
				key:   (new Buffer(key)).toString('hex'),
				iv:    (new Buffer(iv)).toString('hex'),
				tag:   encrypted.tag,
				valid: (res.statusCode === 201)
			}, file);
		});
		var putChunk = function(offset) {
			var nOffset = offset + Cryptocat.File.chunkSize;
			var chunk = encrypted.ciphertext.slice(offset, nOffset);
			if (nOffset < encrypted.ciphertext.length) {
				put.write(chunk, function() {
					onProgress(sas.substring(0, 128), Math.ceil(
						(nOffset * 100) / encrypted.ciphertext.length
					));
					putChunk(nOffset);
				});
			}
			else {
				put.end(chunk);
			}
		};
		put.flushHeaders();
		put.on('error', function(err) {
		});
		put.setTimeout(3000, function() {
			put.abort();
			putFile(
				name, sas, file, key, iv, encrypted,
				onProgress, onEnd
			);
		});
		putChunk(0);
	};

})();
