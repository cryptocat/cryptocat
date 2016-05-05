'use strict';
Cryptocat.Storage = {};

(function() {
	var db = {};
	var EmptyMe = Cryptocat.EmptyMe;
	var EmptyCommon = {
		_id: '*common*',
		mainWindowBounds: {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		},
		rememberedLogin: {
			username: '',
			password: ''
		}
	};
	var settingUpdateDisallowed = [
		'identityKey',
		'identityDHKey',
		'deviceId',
		'deviceName',
		'deviceIcon'
	];

	(function() {
		var path = '';
		if (process.platform === 'win32') {
			path = Path.join(
				process.env.APPDATA,
				'Cryptocat',
				'users.db'
			);
			db = new NeDB({
				filename: path,
				autoload: true
			});
		} else {
			path = Path.join(process.env.HOME, '.config');
			FS.stat(path, function(err, stats) {
				if (err || !stats.isDirectory()) {
					FS.mkdirSync(path, 0o700);
				} else {
					FS.chmodSync(path, 0o700);
				}
				path = Path.join(path, 'Cryptocat');
				FS.stat(path, function(err, stats) {
					if (err || !stats.isDirectory()) {
						FS.mkdirSync(path, 0o700);
					} else {
						FS.chmodSync(path, 0o700);
					}
					db = new NeDB({
						filename: Path.join(path, 'users.db'),
						autoload: true
					});
				});
			});
		}
	})();

	Cryptocat.Storage.updateCommon = function(common, callback) {
		var newObj = {};
		db.findOne({_id: '*common*'}, function(err, doc) {
			if (!doc) {
				newObj = Object.assign({}, EmptyCommon);
			}
			for (var setting in common) {
				if (
					hasProperty(common, setting) &&
					hasProperty(EmptyCommon, setting)
				) {
					newObj[setting] = common[setting];
				}
			}
			if (doc) {
				db.update({_id: '*common*'},
					{$set: newObj}, function(err, newDoc) {
						callback(err);
					}
				);
			} else {
				db.insert(newObj, function(err, newDoc) {
					callback(err);
				});
			}
		});
	};

	Cryptocat.Storage.getCommon = function(callback) {
		var newObj = Object.assign({}, EmptyCommon);
		db.findOne({_id: '*common*'}, function(err, doc) {
			if (!doc) {
				callback(err, null);
				return false;
			}
			for (var setting in newObj) {
				if (
					hasProperty(newObj, setting) &&
					hasProperty(doc, setting)
				) {
					newObj[setting] = doc[setting];
				}
			}
			callback(err, newObj);
		});
	};

	Cryptocat.Storage.updateUser = function(username, loadedSettings, callback) {
		var settings = Object.assign({}, loadedSettings);
		var newObj = {};
		db.findOne({_id: username}, function(err, doc) {
			if (!doc) {
				newObj = Object.assign({}, EmptyMe.settings);
				newObj._id = username;
			}
			for (var setting in settings) {
				if (
					hasProperty(settings, setting) &&
					hasProperty(EmptyMe.settings, setting)
				) {
					if (doc && (settingUpdateDisallowed.indexOf(setting) >= 0)) {
						continue;
					}
					newObj[setting] = settings[setting];
				}
			}
			if (doc) {
				db.update({_id: username},
					{$set: newObj}, function(err, newDoc) {
						callback(err);
					}
				);
			} else {
				db.insert(newObj, function(err, newDoc) {
					callback(err);
				});
			}
		});
	};

	Cryptocat.Storage.updateUserBundles = function(
		username, user, userBundles, overwriteDr, callback
	) {
		var bundleObj = {};
		for (var deviceId in userBundles) { if (hasProperty(userBundles, deviceId)) {
			var bundle = 'userBundles.' + user + '.' + deviceId;
			var dBundle = userBundles[deviceId];
			bundleObj[
				bundle + '.identityKey'
			] = dBundle.identityKey;
			bundleObj[
				bundle + '.signedPreKey'
			] = dBundle.signedPreKey;
			bundleObj[
				bundle + '.signedPreKeyId'
			] = dBundle.signedPreKeyId;
			bundleObj[
				bundle + '.signedPreKeySignature'
			] = dBundle.signedPreKeySignature;
			bundleObj[
				bundle + '.preKeys'
			] = dBundle.preKeys;
			if (overwriteDr) {
				bundleObj[
					bundle + '.dr'
				] = dBundle.dr;
			}
		}}
		db.update({_id: username},
			{$set: bundleObj}, function(err, newDoc) {
				callback(err);
			}
		);
	};

	Cryptocat.Storage.deleteUser = function(username, callback) {
		db.remove({_id: username}, {}, function(err) {
			db.persistence.compactDatafile();
			setTimeout(function() {
				callback(err);
			}, 1000);
		});
	};

	Cryptocat.Storage.getUser = function(username, callback) {
		var newObj = Object.assign({}, EmptyMe.settings);
		var setting = '';
		db.findOne({_id: username}, function(err, doc) {
			if (!doc) {
				callback(err, null);
				return false;
			}
			for (setting in newObj) {
				if (
					hasProperty(EmptyMe.settings, setting) &&
					hasProperty(doc, setting)
				) {
					newObj[setting] = doc[setting];
				}
			}
			callback(err, newObj);
		});
	};
})();
