Cryptocat.Storage = {};

(function() {
	'use strict';
	var db = {};
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
		}
		else {
			path = Path.join(process.env.HOME, '.config');
			FS.stat(path, function(err, stats) {
				if (err || !stats.isDirectory()) {
					FS.mkdirSync(path, 0o700);
				}
				else {
					FS.chmodSync(path, 0o700);
				}
				path = Path.join(path, 'Cryptocat');
				FS.stat(path, function(err, stats) {
					if (err || !stats.isDirectory()) {
						FS.mkdirSync(path, 0o700);
					}
					else {
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
		var newCommon = Object.assign({}, EmptyCommon);
		db.findOne({_id: '*common*'}, function(err, doc) {
			if (doc === null) {
				for (var setting in common) {
					if (
						hasProperty(common, setting) &&
						hasProperty(newCommon, setting)
					) {
						newCommon[setting] = common[setting];
					}
				}
				db.insert(newCommon, function(err, newDoc) {
					db.persistence.compactDatafile();
					callback(err);
				});
			}
			else {
				var updateObj = {};
				for (var setting in common) {
					if (
						hasProperty(common, setting) &&
						hasProperty(newCommon, setting)
					) {
						updateObj[setting] = common[setting];
					}
				}
				db.update({_id: '*common*'},
					{$set: updateObj}, function(err, newDoc) {
						db.persistence.compactDatafile();
						callback(err);
					}
				);
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
		var newObj = Object.assign({}, Cryptocat.EmptyMe.settings);
		db.findOne({_id: username}, function(err, doc) {
			if (doc === null) {
				newObj._id = username;
				for (var setting in newObj) {
					if (
						hasProperty(newObj, setting) &&
						hasProperty(settings, setting)
					) {
						newObj[setting] = settings[setting];
					}
				}
				db.insert(newObj, function(err, newDoc) {
					db.persistence.compactDatafile();
					callback(err);
				});
			}
			else {
				var updateObj = {};
				for (var setting in newObj) {
					if (
						hasProperty(newObj, setting) &&
						hasProperty(settings, setting) &&
						(setting !== 'identityKey') &&
						(setting !== 'identityDHKey') &&
						(setting !== 'deviceId') &&
						(setting !== 'deviceName') &&
						(setting !== 'deviceIcon')
					) {
						updateObj[setting] = settings[setting];
					}
				}
				db.update({_id: username},
					{$set: updateObj}, function(err, newDoc) {
						db.persistence.compactDatafile();
						callback(err);
					}
				);
			}
		});
	};

	Cryptocat.Storage.updateUserBundles = function(
		username, user, userBundles, overwriteAxolotl, callback
	) {
		var bundleObj = {};
		for (var deviceId in userBundles) { if (hasProperty(userBundles, deviceId)) {
			var bundle = 'userBundles.' + user  + '.' + deviceId;
			bundleObj[bundle + '.identityKey'] = userBundles[deviceId].identityKey;
			bundleObj[bundle + '.signedPreKey'] = userBundles[deviceId].signedPreKey;
			bundleObj[bundle + '.signedPreKeyId'] = userBundles[deviceId].signedPreKeyId;
			bundleObj[bundle + '.signedPreKeySignature'] = userBundles[deviceId].signedPreKeySignature;
			bundleObj[bundle + '.preKeys'] = userBundles[deviceId].preKeys;
			if (overwriteAxolotl) {
				bundleObj[bundle + '.axolotl'] = userBundles[deviceId].axolotl;
			}
		}}
		db.update({_id: username},
			{$set: bundleObj}, function(err, newDoc) {
				db.persistence.compactDatafile();
				callback(err);
			}
		);
	};

	Cryptocat.Storage.deleteUser = function(username, callback) {
		db.remove({_id: username}, {}, function(err) {
			db.persistence.compactDatafile();
			callback(err);
		});
	};

	Cryptocat.Storage.getUser = function(username, callback) {
		var newObj = Object.assign({}, Cryptocat.EmptyMe.settings);
		db.findOne({_id: username}, function(err, doc) {
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

})();
