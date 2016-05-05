'use strict';
Cryptocat.Directories = {};

(function() {
	Cryptocat.Directories.getDirectory = function(
		preferred, callback
	) {
		var home = process.env.HOME;
		if (process.platform === 'win32') {
			home = process.env.USERPROFILE;
		}
		var path = Path.join(home, preferred);
		FS.stat(path, function(err, stats) {
			if (err || !stats.isDirectory()) {
				path = Path.join(home, 'Downloads');
				FS.stat(path, function(err, stats) {
					if (err || !stats.isDirectory()) {
						callback(home + Path.sep);
					} else {
						callback(path + Path.sep);
					}
				});
			} else {
				callback(path + Path.sep);
			}
		});
		return false;
	};

	Cryptocat.Directories.saveDialog = function(
		browserWindow, path, name, callback
	) {
		var save = function(path) {
			Dialog.showSaveDialog(browserWindow, {
				title: 'Cryptocat: Save File',
				defaultPath: path
			}, callback);
		};
		FS.stat(path, function(err, stats) {
			if (err || !stats.isDirectory()) {
				Cryptocat.Directories.getDirectory(
					'Desktop', function(d) {
						save(d + name);
					}
				);
			} else {
				save(path + name);
			}
		});
		return false;
	};

	Cryptocat.Directories.openDialog = function(
		browserWindow, path, callback
	) {
		var open = function(path) {
			Dialog.showOpenDialog(browserWindow, {
				title: 'Cryptocat: Select File',
				defaultPath: path,
				properties: ['openFile', 'multiSelections']
			}, callback);
		};
		FS.stat(path, function(err, stats) {
			if (err || !stats.isDirectory()) {
				Cryptocat.Directories.getDirectory(
					'Documents', function(d) {
						open(d);
					}
				);
			} else {
				open(path);
			}
		});
		return false;
	};
})();
