Cryptocat.Update = {
	downloadURIs: {
		win32:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-win32-x64.zip',
		linux:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-linux-x64.zip',
		darwin: 'https://cryptocat.blob.core.windows.net/release/Cryptocat-darwin-x64.zip'
	},
	updateURIs: {
		win32:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-win32-x64.txt',
		linux:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-linux-x64.txt',
		darwin: 'https://cryptocat.blob.core.windows.net/release/Cryptocat-darwin-x64.txt'
	},
	signatureURIs: {
		win32:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-win32-x64.sig',
		linux:  'https://cryptocat.blob.core.windows.net/release/Cryptocat-linux-x64.sig',
		darwin: 'https://cryptocat.blob.core.windows.net/release/Cryptocat-darwin-x64.sig'
	},
	signingKey: [
		0x36, 0x91, 0xcc, 0x5e, 0xd9, 0x1a, 0x83, 0x70,
		0x60, 0xd3, 0x1f, 0x20, 0x04, 0xa7, 0x87, 0x09,
		0x88, 0x6a, 0x93, 0xeb, 0xa8, 0xb0, 0x2d, 0xa3,
		0x55, 0xa2, 0x59, 0x30, 0xe4, 0x49, 0xa0, 0x80
	]
};

(function() {
	'use strict';

	var compareVersionStrings = function(local, remote) {
		if (local === remote) { return false; };
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

	Cryptocat.Update.check = function(ifLatest) {
		HTTPS.get(Cryptocat.Update.updateURIs[process.platform], function(res) {
			var latest = '';
			res.on('data', function(chunk) {
				latest += chunk;
			});
			res.on('end', function() {
				latest = latest.replace(/(\r\n|\n|\r)/gm, '');
				if (!Cryptocat.Patterns.version.test(latest)) {
					Cryptocat.Diag.error.updateCheck();
					return false;
				}
				if (compareVersionStrings(Cryptocat.Version, latest)) {
					Cryptocat.Diag.message.updateAvailable(function(response) {
						if (response === 0) {
							Cryptocat.Win.create.updateDownloader();
						}
					})
				}
				else {
					console.info(
						'Cryptocat.Update:',
						'No updates available (' + latest + ').'
					);
					ifLatest();
				}
			});
		}).on('error', function(err) {
			Cryptocat.Diag.error.updateCheck();
		});
	};

	// Run on application start
	Cryptocat.Update.check(function() {
	});
})();
