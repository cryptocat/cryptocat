'use strict';

(function() {
	var downloadServer = `https://download.${Cryptocat.Hostname}/`;
	Cryptocat.Update = {
		clientURIs: {
			win32: `${downloadServer}client/Cryptocat-win32-x64.zip`,
			linux: `${downloadServer}client/Cryptocat-linux-x64.zip`,
			darwin: `${downloadServer}client/Cryptocat-darwin-x64.zip`
		},
		verURIs: {
			win32: `${downloadServer}ver/Cryptocat-win32-x64.txt`,
			linux: `${downloadServer}ver/Cryptocat-linux-x64.txt`,
			darwin: `${downloadServer}ver/Cryptocat-darwin-x64.txt`
		},
		sigURIs: {
			win32: `${downloadServer}sig/Cryptocat-win32-x64.txt`,
			linux: `${downloadServer}sig/Cryptocat-linux-x64.txt`,
			darwin: `${downloadServer}sig/Cryptocat-darwin-x64.txt`
		},
		signingKey: [
			0x36, 0x91, 0xcc, 0x5e, 0xd9, 0x1a, 0x83, 0x70,
			0x60, 0xd3, 0x1f, 0x20, 0x04, 0xa7, 0x87, 0x09,
			0x88, 0x6a, 0x93, 0xeb, 0xa8, 0xb0, 0x2d, 0xa3,
			0x55, 0xa2, 0x59, 0x30, 0xe4, 0x49, 0xa0, 0x80
		]
	};
})();

(function() {
	var compareVersionStrings = function(local, remote) {
		if (local === remote) { return false; }
		var l = local.split('.');
		var r = remote.split('.');
		if (parseInt(r[0]) > parseInt(l[0])) {
			return true;
		}
		if (parseInt(r[1]) > parseInt(l[1])) {
			return true;
		}
		if (parseInt(r[2]) > parseInt(l[2])) {
			return true;
		}
		return false;
	};

	Cryptocat.Update.saveDialog = function(browserWindow, callback) {
		var save = function(path) {
			Dialog.showSaveDialog(browserWindow, {
				title: 'Cryptocat: Save Update Installer',
				defaultPath: path,
				filters: [{
					name: 'Archives',
					extensions: ['zip']
				}]
			}, callback);
		};
		var name = 'Cryptocat-' + process.platform + '-x64.zip';
		Cryptocat.Directories.getDirectory(
			'Downloads', function(d) {
				save(d + name);
			}
		);
	};

	Cryptocat.Update.updateAvailable = function(latest) {
		Cryptocat.Diag.message.updateAvailable(function(response) {
			if (response === 0) {
				Cryptocat.Win.create.updateDownloader();
			}
			if (response === 1) {
				Remote.shell.openExternal(
					`https://${Cryptocat.Hostname}/news.html#${latest}`
				);
				Cryptocat.Update.updateAvailable(latest);
			}
		});
	};

	Cryptocat.Update.check = function(verbose, ifLatest) {
		Cryptocat.Pinning.get(
			Cryptocat.Update.verURIs[process.platform], 0,
			function(res, valid) {
				if (!valid) {
					if (verbose) {
						Cryptocat.Diag.error.updateCheck();
					}
					return false;
				}
				var latest = '';
				res.on('data', function(chunk) {
					latest += chunk;
				});
				res.on('end', function() {
					latest = latest.replace(/(\r\n|\n|\r)/gm, '');
					if (!Cryptocat.Patterns.version.test(latest)) {
						if (verbose) {
							Cryptocat.Diag.error.updateCheck();
						}
						return false;
					}
					if (compareVersionStrings(Cryptocat.Version, latest)) {
						Cryptocat.Update.updateAvailable(latest);
					} else {
						console.info(
							'Cryptocat.Update:',
							`No updates available (${latest}).`
						);
						ifLatest();
					}
				});
			}
		);
	};

	Cryptocat.Update.verifySignature = function(hash, callback) {
		var signature = '';
		Cryptocat.Pinning.get(
			Cryptocat.Update.sigURIs[process.platform], 0,
			function(res, valid) {
				if (!valid) {
					callback(false);
					return false;
				}
				res.on('data', function(chunk) {
					signature += chunk;
				});
				res.on('end', function() {
					signature = signature.replace(/(\r\n)|\n|\r/gm, '');
					var valid = ProScript.crypto.ED25519.checkValid(
						signature, hash, Cryptocat.Update.signingKey
					);
					callback(valid);
				});
			}
		);
	};

	// Check on application start.
	Cryptocat.Update.check(true, () => {});

	// Check every 24 hours.
	setInterval(() => {
		Cryptocat.Update.check(false, () => {});
	}, (1000 * 3600 * 24));
})();
