Cryptocat.Update = {
	clientURIs: {
		win32:  'https://download.crypto.cat/client/Cryptocat-win32-x64.zip',
		linux:  'https://download.crypto.cat/client/Cryptocat-linux-x64.zip',
		darwin: 'https://download.crypto.cat/client/Cryptocat-darwin-x64.zip'
	},
	verURIs: {
		win32:  'https://download.crypto.cat/ver/Cryptocat-win32-x64.txt',
		linux:  'https://download.crypto.cat/ver/Cryptocat-linux-x64.txt',
		darwin: 'https://download.crypto.cat/ver/Cryptocat-darwin-x64.txt'
	},
	sigURIs: {
		win32:  'https://download.crypto.cat/sig/Cryptocat-win32-x64.txt',
		linux:  'https://download.crypto.cat/sig/Cryptocat-linux-x64.txt',
		darwin: 'https://download.crypto.cat/sig/Cryptocat-darwin-x64.txt'
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

	Cryptocat.Update.updateAvailable = function(latest) {
		Cryptocat.Diag.message.updateAvailable(function(response) {
			if (response === 0) {
				Cryptocat.Win.create.updateDownloader();
			}
			if (response === 1) {
				Remote.shell.openExternal('https://crypto.cat/news.html#' + latest);
				Cryptocat.Update.updateAvailable(latest);
			}
		});
	};

	Cryptocat.Update.check = function(ifLatest) {
		HTTPS.get(Cryptocat.Update.verURIs[process.platform], function(res) {
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
					Cryptocat.Update.updateAvailable(latest);
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
