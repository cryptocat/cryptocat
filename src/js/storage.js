Cryptocat.Storage = {};

(function() {
	'use strict';
	const NeDB = require('nedb');
	
	const AppDataPath = (function() {
		if (process.platform === 'win32') {
			return process.env.APPDATA + '\\Cryptocat\\';
		}
		else {
			var fs = require('fs');
			var path = process.env.HOME + '/.config';
			try { fs.mkdirSync(path) } catch(e) {};
			path += '/Cryptocat';
			try { fs.mkdirSync(path) } catch(e) {};
			path += '/';
			return path;
		}
	})();

	var db = new NeDB({
		filename: AppDataPath + 'users.db',
		autoload: true
	});

	Cryptocat.Storage.updateUser = function(username, settings, callback) {
		var newSettings = {
			identityKey: {priv: [], pub: []},
			identityDHKey: [],
			deviceId: '',
			deviceName: '',
			deviceIcon: 0,
			deviceIds: [],
			signedPreKey: {priv: [], pub: []},
			signedPreKeyId: 0,
			signedPreKeySignature: '',
			preKeys: [],
			userBundles: {},
			sounds: true,
			notify: true,
			status: 2,
			refresh: 0
		};
		db.findOne({_id: username}, function(err, doc) {
			if (doc === null) {
				newSettings._id = username;
				if (hasProperty(settings, 'identityKey')) {
					newSettings.identityKey = settings.identityKey;
				}
				if (hasProperty(settings, 'identityDHKey')) {
					newSettings.identityDHKey = settings.identityDHKey;
				}
				if (hasProperty(settings, 'deviceId')) {
					newSettings.deviceId = settings.deviceId;
				}
				if (hasProperty(settings, 'deviceName')) {
					newSettings.deviceName = settings.deviceName;
				}
				if (hasProperty(settings, 'deviceIcon')) {
					newSettings.deviceIcon = settings.deviceIcon;
				}
				if (hasProperty(settings, 'deviceIds')) {
					newSettings.deviceIds = settings.deviceIds;
				}
				if (hasProperty(settings, 'signedPreKey')) {
					newSettings.signedPreKey = settings.signedPreKey;
				}
				if (hasProperty(settings, 'signedPreKeyId')) {
					newSettings.signedPreKeyId = settings.signedPreKeyId;
				}
				if (hasProperty(settings, 'signedPreKeySignature')) {
					newSettings.signedPreKeySignature = settings.signedPreKeySignature;
				}
				if (hasProperty(settings, 'preKeys')) {
					newSettings.preKeys = settings.preKeys;
				}
				if (hasProperty(settings, 'userBundles')) {
					newSettings.userBundles = settings.userBundles;
				}
				if (hasProperty(settings, 'sounds')) {
					newSettings.sounds = settings.sounds;
				}
				if (hasProperty(settings, 'notify')) {
					newSettings.notify = settings.notify;
				}
				if (hasProperty(settings, 'status')) {
					newSettings.status = settings.status;
				}
				if (hasProperty(settings, 'refresh')) {
					newSettings.refresh = settings.refresh;
				}
				db.insert(newSettings, function(err, newDoc) {
					db.persistence.compactDatafile();
					setTimeout(function() {	
						callback(err)
					}, 500);
				});
			}
			else {
				var updateObj = {};
				if (hasProperty(settings, 'identityKey')) {
					// Resetting identity disabled (no use-case)
					// updateObj.identityKey = settings.identityKey;
				}
				if (hasProperty(settings, 'identityDHKey')) {
					// Resetting identity disabled (no use-case)
					// updateObj.identityDHKey = settings.identityDHKey;
				}
				if (hasProperty(settings, 'deviceId')) {
					updateObj.deviceId = settings.deviceId;
				}
				if (hasProperty(settings, 'deviceName')) {
					// Resetting identity disabled (no use-case)
					// updateObj.deviceName = settings.deviceName;
				}
				if (hasProperty(settings, 'deviceIcon')) {
					// Resetting identity disabled (no use-case)
					// updateObj.deviceIcon = settings.deviceIcon;
				}
				if (hasProperty(settings, 'deviceIds')) {
					updateObj.deviceIds = settings.deviceIds;
				}
				if (hasProperty(settings, 'signedPreKey')) {
					updateObj.signedPreKey = settings.signedPreKey;
				}
				if (hasProperty(settings, 'signedPreKeyId')) {
					updateObj.signedPreKeyId = settings.signedPreKeyId;
				}
				if (hasProperty(settings, 'signedPreKeySignature')) {
					updateObj.signedPreKeySignature = settings.signedPreKeySignature;
				}
				if (hasProperty(settings, 'preKeys')) {
					updateObj.preKeys = settings.preKeys;
				}
				if (hasProperty(settings, 'userBundles')) {
					updateObj.userBundles = settings.userBundles;
				}
				if (hasProperty(settings, 'sounds')) {
					updateObj.sounds = settings.sounds;
				}
				if (hasProperty(settings, 'notify')) {
					updateObj.notify = settings.notify;
				}
				if (hasProperty(settings, 'status')) {
					updateObj.status = settings.status;
				}
				if (hasProperty(settings, 'refresh')) {
					updateObj.refresh = settings.refresh;
				}
				db.update({_id: username},
					{$set: updateObj}, function(err, newDoc) {
						db.persistence.compactDatafile();
						setTimeout(function() {	
							callback(err);
						}, 500);
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
			bundleObj[bundle + '.identityKey']           = userBundles[deviceId].identityKey;
			bundleObj[bundle + '.signedPreKey']          = userBundles[deviceId].signedPreKey;
			bundleObj[bundle + '.signedPreKeyId']        = userBundles[deviceId].signedPreKeyId;
			bundleObj[bundle + '.signedPreKeySignature'] = userBundles[deviceId].signedPreKeySignature;
			bundleObj[bundle + '.preKeys']               = userBundles[deviceId].preKeys;
			if (overwriteAxolotl) {
				bundleObj[bundle + '.axolotl']           = userBundles[deviceId].axolotl;
			}
		}}
		db.update({_id: username},
			{$set: bundleObj}, function(err, newDoc) {
				db.persistence.compactDatafile();
				setTimeout(function() {
					callback(err);
				}, 500);
			}
		);
	};

	Cryptocat.Storage.deleteUser = function(username, callback) {
		db.remove({_id: username}, {}, function(err) {
			db.persistence.compactDatafile();
			setTimeout(function() {
				callback(err);
			}, 500);
		});
	};

	Cryptocat.Storage.getUser = function(username, callback) {
		db.findOne({_id: username}, function(err, doc) {
			callback(err, doc);
		});
	};

})();
