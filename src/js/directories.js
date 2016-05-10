'use strict';
Cryptocat.Directories = {
	getDirectory(preferred, callback) {
		var home = process.env.HOME;
		if (process.platform === 'win32') {
			home = process.env.USERPROFILE;
		}
		var path = Path.join(home, preferred);
		FS.stat(path, (err, stats) => {
			if (err || !stats.isDirectory()) {
				path = Path.join(home, 'Downloads');
				FS.stat(path, (err, stats) => {
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
	},

	saveDialog(browserWindow, path, name, callback) {
		var save = (path) => {
			Dialog.showSaveDialog(browserWindow, {
				title: 'Cryptocat: Save File',
				defaultPath: path
			}, callback);
		};
		FS.stat(path, (err, stats) => {
			if (err || !stats.isDirectory()) {
				Cryptocat.Directories.getDirectory(
					'Desktop', (d) => {
						save(d + name);
					}
				);
			} else {
				save(path + name);
			}
		});
		return false;
	},

	openDialog(browserWindow, path, callback) {
		var open = (path) => {
			Dialog.showOpenDialog(browserWindow, {
				title: 'Cryptocat: Select File',
				defaultPath: path,
				properties: ['openFile', 'multiSelections']
			}, callback);
		};
		FS.stat(path, (err, stats) => {
			if (err || !stats.isDirectory()) {
				Cryptocat.Directories.getDirectory(
					'Documents', (d) => {
						open(d);
					}
				);
			} else {
				open(path);
			}
		});
		return false;
	}
};
