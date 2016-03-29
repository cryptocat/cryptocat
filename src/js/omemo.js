Cryptocat.OMEMO = {};

(function() {
	'use strict';
	var callbacks = {
		setup: {
			armed: false,
			payload: function() {}
		}
	};
	
	Cryptocat.OMEMO.jidHasUsername = function(jid) {
		var username = '';
		var valid    = false;
		if (jid.match(/^([a-z0-9]|_)+/g).length === 1) { 
			username = jid.match(/^([a-z0-9]|_)+/g)[0];
			if (
				(Cryptocat.Patterns.username.test(username)) && (
					(username === Cryptocat.Me.username) ||
					(hasProperty(Cryptocat.Win.main.roster.state.buddies, username))
				)
			) {
				valid = true;
			}
			else {
				username = '';
			}
		};
		return {
			username: username,
			valid: valid
		};
	};

	Cryptocat.OMEMO.nodeHasDeviceId = function(node) {
		var pattern  = /^urn:xmpp:omemo:0:bundles:([0-9]|a|b|c|d|e|f){64}$/;
		var deviceId = '';
		var valid    = false;
		if (pattern.test(node)) {
			deviceId = node.match(pattern)[0].substr(25);
			valid = true;
		}
		return {
			deviceId: deviceId,
			valid: valid
		};
	};

	Cryptocat.OMEMO.extractPreKeys = function(preKeys) {
		var extracted = {};
		preKeys.forEach(function(preKey, index) {
			if (
				hasProperty(preKey,                 '_') &&
				hasProperty(preKey,                 '$') &&
				hasProperty(preKey.$,        'preKeyId') &&
				Cryptocat.Patterns.hex32.test(preKey._)  &&
				(preKey.$.preKeyId === (index + ''))
			) {
				extracted[preKey.$.preKeyId] = preKey._;
			}
		});
		return extracted;
	};

	Cryptocat.OMEMO.selectPreKey = function(username, deviceId) {
		var bundle = Cryptocat.Me.settings.userBundles[username][deviceId];
		var preKeyId = -1;
		var a = new Uint8Array(1);
		while (preKeyId < 0) {
			window.crypto.getRandomValues(a);
			var r = Math.floor(a[0] / 2.55);
			if (Cryptocat.Patterns.hex32.test(bundle.preKeys[r])) {
				preKeyId = r;
			}
		}
		return preKeyId;
	};

	Cryptocat.OMEMO.plugins = {
		deviceList: function(client, stanza) {
			var deviceListGetSet = {
				get: function() {},
				set: function(deviceIds) {
					var _this = this;
					deviceIds.forEach(function(deviceId) {
						var device = stanza.utils.createElement('', 'device', '');
						stanza.utils.setAttribute(device, 'id', deviceId);
						_this.xml.appendChild(device);
					});
				}
			};
			var deviceList = stanza.define({
				name: 'devicelist',
				namespace: 'urn:xmpp:omemo:0',
				element: 'list',
				fields: {
					deviceIds: deviceListGetSet
				}
			});
			stanza.withPubsubItem(function(pubSub) {
				stanza.extend(pubSub, deviceList);
			});
		},
		bundle: function(client, stanza) {
			var bundleGetSet = {
				get: function() {},
				set: function(items) {
					var identityKey    = items.identityKey;
					var identityDHKey  = items.identityDHKey;
					var signedPreKey   = items.signedPreKey;
					var signedPreKeyId = items.signedPreKeyId;
					var sPKSignature   = items.signedPreKeySignature;
					var preKeys        = items.preKeys;
					var bATHS          = ProScript.encoding.byteArrayToHexString;
					var iKElement      = stanza.utils.createElement('', 'identityKey', '');
					var sPKElement     = stanza.utils.createElement('', 'signedPreKeyPublic', '');
					var sPKSElement    = stanza.utils.createElement('', 'signedPreKeySignature', '');
					var pKsElement     = stanza.utils.createElement('', 'prekeys', '');
					stanza.utils.setText(iKElement,   bATHS(identityKey) + bATHS(identityDHKey));
					stanza.utils.setAttribute(iKElement, 'deviceName', items.deviceName);
					stanza.utils.setAttribute(iKElement, 'deviceIcon', items.deviceIcon + '');
					stanza.utils.setText(sPKElement,  bATHS(signedPreKey));
					stanza.utils.setAttribute(sPKElement, 'signedPreKeyId', signedPreKeyId + '');
					stanza.utils.setText(sPKSElement, sPKSignature);
					preKeys.forEach(function(preKey, preKeyId) {
						var pKElement = stanza.utils.createElement('', 'preKeyPublic', '');
						stanza.utils.setAttribute(pKElement, 'preKeyId', preKeyId + '');
						stanza.utils.setText(pKElement, bATHS(preKey.pub));
						pKsElement.appendChild(pKElement);
					});
					this.xml.appendChild(iKElement);
					this.xml.appendChild(sPKElement);
					this.xml.appendChild(sPKSElement);
					this.xml.appendChild(pKsElement);
				}
			};
			var bundle = stanza.define({
				name: 'bundle',
				namespace: 'urn:xmpp:omemo:0',
				element: 'bundle',
				fields: {
					bundleItems: bundleGetSet
				}
			});
			stanza.withPubsubItem(function(pubSub) {
				stanza.extend(pubSub, bundle);
			});
		},
		encrypted: function(client, stanza) {
			var encryptedGetSet = {
				get: function() {
					var jid = this.parent.xml.attrs.from;
					if (!jid) { return false; }
					var fromUser = Cryptocat.OMEMO.jidHasUsername(jid);
					if (!fromUser.valid) { return false; }
					XML2JS.parseString(this.xml.parent, function(err, res) {
						if (!hasProperty(res, 'message')) {
							return false;
						}
						var myInfo = {
							stamp: (new Date()).toString(),
							offline: false
						};
						res = res.message;
						if (
							Array.isArray(res.delay)             &&
							hasProperty(res.delay, '0')          &&
							hasProperty(res.delay[0], '$')       &&
							hasProperty(res.delay[0].$, 'stamp') &&
							Cryptocat.Patterns.dateTime.test(res.delay[0].$.stamp)
						) {
							myInfo.stamp   = res.delay[0].$.stamp;
							myInfo.offline = true;
						}
						if (
							err                                               ||
							!Array.isArray(res.encrypted)                     ||
							!hasProperty(res.encrypted, '0')                  ||
							!Array.isArray(res.encrypted[0].header)           ||
							!Array.isArray(res.encrypted[0].header[0].key)    ||
							!Array.isArray(res.encrypted[0].header[0].iv)     ||
							!Array.isArray(res.encrypted[0].header[0].tag)    ||
							!Array.isArray(res.encrypted[0].payload)          ||
							!hasProperty(res.encrypted[0].header[0], '$')     ||
							!hasProperty(res.encrypted[0].header[0].$, 'sid')
						) {
							return false;
						}
						res = res.encrypted[0];
						res.header[0].key.forEach(function(key) {
							if (
								(key.$.rid !== Cryptocat.Me.settings.deviceId) ||
								!Array.isArray(key.ciphertext)                 ||
								!Array.isArray(key.ephemeralKey)               ||
								!Array.isArray(key.initEphemeralKey)           ||
								!Array.isArray(key.iv)                         ||
								!Array.isArray(key.tag)                        ||
								!Array.isArray(key.preKeyId)
							) {
								return false;
							}
							myInfo.key = {
								ciphertext:       key.ciphertext[0],
								ephemeralKey:     key.ephemeralKey[0],
								initEphemeralKey: key.initEphemeralKey[0],
								iv:               key.iv[0],
								tag:              key.tag[0],
								preKeyId:         key.preKeyId[0]
							};
							myInfo.iv      = res.header[0].iv[0];
							myInfo.tag     = res.header[0].tag[0];
							myInfo.payload = res.payload[0];
							myInfo.sid     = res.header[0].$.sid;
							myInfo.from    = fromUser.username;
						});
						if (hasProperty(myInfo, 'key')) {
							client.emit('encrypted', myInfo);
						}
					});
				},
				set: function(items) {
					var devices  = items.devices;
					var payload  = items.payload;
					var sid      = items.sid;
					var bATHS    = ProScript.encoding.byteArrayToHexString;
					var hElement = stanza.utils.createElement('', 'header', '');
					var iElement = stanza.utils.createElement('', 'iv', '');
					var tElement = stanza.utils.createElement('', 'tag', '');
					var pElement = stanza.utils.createElement('', 'payload', '');
					stanza.utils.setAttribute(hElement, 'sid', sid);
					stanza.utils.setText(iElement, payload.iv);
					stanza.utils.setText(tElement, payload.tag);
					stanza.utils.setText(pElement, payload.ciphertext);
					hElement.appendChild(iElement);
					hElement.appendChild(tElement);
					for (var deviceId in devices) { if (hasProperty(devices, deviceId)) {
						var kElement    = stanza.utils.createElement('', 'key', '');
						var _cElement   = stanza.utils.createElement('', 'ciphertext', '');
						var _eKElement  = stanza.utils.createElement('', 'ephemeralKey', '');
						var _iEKElement = stanza.utils.createElement('', 'initEphemeralKey', '');
						var _iElement   = stanza.utils.createElement('', 'iv', '');
						var _tElement   = stanza.utils.createElement('', 'tag', '');
						var _pKIElement = stanza.utils.createElement('', 'preKeyId', '');
						stanza.utils.setAttribute(kElement, 'rid', deviceId);
						stanza.utils.setText(_cElement,   devices[deviceId].ciphertext);
						stanza.utils.setText(_eKElement,  bATHS(devices[deviceId].ephemeralKey));
						stanza.utils.setText(_iEKElement, bATHS(devices[deviceId].initEphemeralKey));
						stanza.utils.setText(_iElement,   bATHS(devices[deviceId].iv));
						stanza.utils.setText(_tElement,   devices[deviceId].tag);
						stanza.utils.setText(_pKIElement, devices[deviceId].preKeyId);
						kElement.appendChild(_cElement);
						kElement.appendChild(_eKElement);
						kElement.appendChild(_iEKElement);
						kElement.appendChild(_iElement);
						kElement.appendChild(_tElement);
						kElement.appendChild(_pKIElement);
						hElement.appendChild(kElement);
					}};
					this.xml.appendChild(hElement);
					this.xml.appendChild(pElement);
				}
			};
			var encrypted = stanza.define({
				name: 'encrypted',
				namespace: 'urn:xmpp:omemo:0',
				element: 'encrypted',
				fields: {
					encryptedItems: encryptedGetSet
				}
			});
			stanza.withMessage(function(message) {
				stanza.extend(message, encrypted);
			})
		}
	};

	Cryptocat.OMEMO.isProperBundle = function(data) {
		return (
			hasProperty(data,                                                     'item')          &&
			hasProperty(data.item,                                                   '0')          &&
			hasProperty(data.item[0],                                           'bundle')          &&
			hasProperty(data.item[0].bundle,                                         '0')          &&
			Array.isArray(data.item[0].bundle[0].identityKey)                                      &&
			hasProperty(data.item[0].bundle[0].identityKey,                          '0')          &&
			hasProperty(data.item[0].bundle[0].identityKey[0],                       '$')          &&
			hasProperty(data.item[0].bundle[0].identityKey[0],                       '_')          &&
			hasProperty(data.item[0].bundle[0].identityKey[0].$,               'deviceName')       &&
			hasProperty(data.item[0].bundle[0].identityKey[0].$,               'deviceIcon')       &&
			Cryptocat.Patterns.deviceName.test(data.item[0].bundle[0].identityKey[0].$.deviceName) &&
			Cryptocat.Patterns.deviceIcon.test(data.item[0].bundle[0].identityKey[0].$.deviceIcon) &&
			Array.isArray(data.item[0].bundle[0].signedPreKeyPublic)                               &&
			hasProperty(data.item[0].bundle[0].signedPreKeyPublic,                   '0')          &&
			hasProperty(data.item[0].bundle[0].signedPreKeyPublic[0],                '$')          &&
			hasProperty(data.item[0].bundle[0].signedPreKeyPublic[0],                '_')          &&
			hasProperty(data.item[0].bundle[0].signedPreKeyPublic[0].$, 'signedPreKeyId')          &&
			Array.isArray(data.item[0].bundle[0].signedPreKeySignature)                            &&
			hasProperty(data.item[0].bundle[0].signedPreKeySignature,                '0')          &&
			Array.isArray(data.item[0].bundle[0].prekeys)                                          &&
			hasProperty(data.item[0].bundle[0].prekeys,                              '0')          &&
			Array.isArray(data.item[0].bundle[0].prekeys[0].preKeyPublic)                          &&
			(data.item[0].bundle[0].prekeys[0].preKeyPublic.length === 100)                        &&
			Cryptocat.Patterns.hex64.test(data.item[0].bundle[0].identityKey[0]._)                 &&
			Cryptocat.Patterns.hex32.test(data.item[0].bundle[0].signedPreKeyPublic[0]._)          &&
			Cryptocat.Patterns.hex64.test(data.item[0].bundle[0].signedPreKeySignature[0])
		)
	};

	Cryptocat.OMEMO.setup = function(callback) {
		Cryptocat.Storage.getUser(Cryptocat.Me.username, function(err, doc) {
			if (doc !== null) {
				Cryptocat.Me.settings = doc;
				var now  = Math.floor(Date.now() / 1000);
				var then = Cryptocat.Me.settings.refresh;
				if (!then || ((now - then) > 604800)) {
					Cryptocat.OMEMO.refreshOwnBundle(
						Cryptocat.Me.settings.identityKey, callback
					);
				}
				else {
					callback();
				}
			}
			else {
				Cryptocat.Diag.message.deviceSetup(function(response) {
					if (response === 0) {
						callbacks.setup.payload = callback;
						callbacks.setup.armed   = true;
						Cryptocat.Win.create.addDevice();
					}
					if (response === 1) {
						Remote.shell.openExternal(
							'https://crypto.cat/help.html#managingDevices'
						);
						Cryptocat.Win.main.beforeQuit();
					}
					if (response === 2) {
						Cryptocat.Win.main.beforeQuit();
					}
				});
			}
		});
	};

	Cryptocat.OMEMO.onAddDevice = function(deviceName, deviceIcon) {
		var identityKey   = Cryptocat.Axolotl.newIdentityKey();
		var identityDHKey = Cryptocat.Axolotl.getDHPublicKey(identityKey.priv);
		var deviceId      = ProScript.encoding.byteArrayToHexString(
			ProScript.crypto.random32Bytes('o0')
		);
		var callback = function() {};
		if (callbacks.setup.armed) {
			callback = callbacks.setup.payload;
			callbacks.setup.armed = false;
		}
		Cryptocat.Storage.updateUser(Cryptocat.Me.username, {
			identityKey: identityKey,
			identityDHKey: identityDHKey,
			deviceId: deviceId,
			deviceName: deviceName,
			deviceIcon: deviceIcon
		}, function(newErr) {
			Cryptocat.Me.settings.identityKey           = identityKey;
			Cryptocat.Me.settings.identityDHKey         = identityDHKey;
			Cryptocat.Me.settings.deviceId              = deviceId;
			Cryptocat.Me.settings.deviceName            = deviceName;
			Cryptocat.Me.settings.deviceIcon            = deviceIcon;
			Cryptocat.OMEMO.refreshOwnBundle(identityKey, callback);
		});
	};

	Cryptocat.OMEMO.refreshOwnBundle = function(identityKey, callback) {
		console.info('Cryptocat.OMEMO:', 'Refreshing own bundle.');
		var now = Math.floor(Date.now() / 1000);
		var signedPreKey          = Cryptocat.Axolotl.newKeyPair();
		var signedPreKeySignature = ProScript.crypto.ED25519.signature(
			ProScript.encoding.byteArrayToHexString(signedPreKey.pub),
			identityKey.priv, identityKey.pub
		);
		var preKeys = [];
		for (var i = 0; i < 100; i++) {
			preKeys.push(Cryptocat.Axolotl.newKeyPair());
		}
		Cryptocat.Storage.updateUser(Cryptocat.Me.username, {
			signedPreKey: signedPreKey,
			signedPreKeySignature: signedPreKeySignature,
			preKeys: preKeys,
			refresh: now
		}, function(newErr) {
			Cryptocat.Me.settings.signedPreKey          = signedPreKey;
			Cryptocat.Me.settings.signedPreKeySignature = signedPreKeySignature;
			Cryptocat.Me.settings.preKeys               = preKeys;
			Cryptocat.Me.settings.refresh               = now;
			callback();
		});
	};

	Cryptocat.OMEMO.rebuildDeviceSession = function(username, deviceId) {
		var userBundles = Cryptocat.Me.settings.userBundles;
		if (
			!hasProperty(userBundles, username)                      ||
			!hasProperty(userBundles[username], deviceId)            ||
			!hasProperty(userBundles[username][deviceId], 'axolotl')
		) {
			return false;
		}
		console.info('Cryptocat.OMEMO', 'Rebuilding Axolotl session with ' + username);
		delete userBundles[username][deviceId].axolotl;
		Cryptocat.OMEMO.sendMessage(username, '');
		return true;
	}; 

	Cryptocat.OMEMO.onGetDeviceList = function(username, deviceIds) {
		console.info('Cryptocat.OMEMO', username + ' has a new deviceList.');
		var userBundles = Cryptocat.Me.settings.userBundles;
		deviceIds = deviceIds.filter(function(item, pos) {
			return deviceIds.indexOf(item) === pos;
		});
		console.info(deviceIds);
		if (username === Cryptocat.Me.username) {
			if (deviceIds.indexOf(Cryptocat.Me.settings.deviceId) < 0) {
				Cryptocat.XMPP.sendDeviceList(deviceIds.concat(
					[Cryptocat.Me.settings.deviceId]
				));
				Cryptocat.XMPP.sendBundle();
				setTimeout(function() {
					Cryptocat.XMPP.getDeviceList(username);
				}, 1000);
			}
			else {
				Cryptocat.Me.settings.deviceIds = deviceIds;
			}
		}
		else {
			if (
				(Cryptocat.Win.main.roster.getBuddyStatus(username) === 0) &&
				deviceIds.length
			) {
				Cryptocat.Win.main.roster.updateBuddyStatus(username, 1, false);
			}
			if (!deviceIds.length) {
				Cryptocat.Win.main.roster.updateBuddyStatus(username, 0, false);
			}
		}
		if (hasProperty(userBundles, username)) {
			for (var userBundle in userBundles[username]) {
				if (
					hasProperty(userBundles[username], userBundle)  &&
					(userBundle !== Cryptocat.Me.settings.deviceId) &&
					(deviceIds.indexOf(userBundle) < 0)
				) {
					delete userBundles[username][userBundle];
				}
			}
		}
		for (var i = 0; i < deviceIds.length; i++) {
			Cryptocat.XMPP.getBundle(username, deviceIds[i]);
		}
	};

	Cryptocat.OMEMO.onGetBundle = function(username, deviceId, userBundle) {
		var isNewUser   = false;
		var isNewBundle = false;
		if (!hasProperty(Cryptocat.Me.settings.userBundles, username)) {
			Cryptocat.Me.settings.userBundles[username] = {};
			isNewUser = true;
		}
		if (!hasProperty(Cryptocat.Me.settings.userBundles[username], deviceId)) {
			Cryptocat.Me.settings.userBundles[username][deviceId] = {};
			isNewBundle = true;
		}
		var thisBundle = Cryptocat.Me.settings.userBundles[username][deviceId];
		if (isNewBundle) {
			thisBundle.identityKey = userBundle.identityKey;
			thisBundle.deviceName  = userBundle.deviceName;
			thisBundle.deviceIcon  = userBundle.deviceIcon;
		}
		thisBundle.signedPreKey          = userBundle.signedPreKey;
		thisBundle.signedPreKeyId        = userBundle.signedPreKeyId;
		thisBundle.signedPreKeySignature = userBundle.signedPreKeySignature;
		thisBundle.preKeys               = userBundle.preKeys;
		if (!isNewUser && isNewBundle) {
			Cryptocat.Diag.message.newDevice(username, function(response) {
				if (response === 0) {
					Cryptocat.Win.create.deviceManager(username);
				}
			});
		}
	};

	Cryptocat.OMEMO.deviceFingerprint = function(
		username, deviceId, deviceName, deviceIcon, identityKey
	) {
		var dNIHash = (function() {
			var h = '';
			for (var i = 0; i < username.length; i++) {
				h += ProScript.encoding.a2h(username);
			}
			for (var i = 0; i < deviceName.length; i++) {
				h += ProScript.encoding.a2h(deviceName[i]);
			}
			h += ProScript.encoding.a2h(deviceIcon);
			return ProScript.crypto.SHA256(h);
		})();
		var hash = ProScript.crypto.SHA256(
			deviceId + dNIHash + identityKey
		).substr(0, 32);
		return (function() {
			var fp = '';
			for (var i = 0; i < 32; i+=2) {
				fp += hash[i] + hash[i+1];
				if (i !== 30) { fp += ':'; }
			}
			return fp;
		})();
	};

	Cryptocat.OMEMO.sendMessage = function(username, message) {
		var res = {
			devices: {},
			payload: {},
			sid: Cryptocat.Me.settings.deviceId
		}
		if (message.length) {
			while (message.length % 32) {
				message += String.fromCharCode(0);
			}
		}
		var bundles    = Cryptocat.Me.settings.userBundles[username];
		var messageKey = ProScript.crypto.random32Bytes('o2');
		var messageIv  = ProScript.crypto.random12Bytes('o3');
		var messageEnc = ProScript.crypto.AESGCMEncrypt(
			messageKey, messageIv, message, ''
		);
		res.payload.iv         = ProScript.encoding.byteArrayToHexString(messageIv);
		res.payload.ciphertext = messageEnc.ciphertext;
		res.payload.tag        = messageEnc.tag;
		for (var deviceId in bundles) { if (hasProperty(bundles, deviceId)) {
			if (!hasProperty(bundles[deviceId], 'axolotl')) {
				var preKeyId = Cryptocat.OMEMO.selectPreKey(username, deviceId);
				var iK       = bundles[deviceId].identityKey.substr(0,   64);
				var iDHK     = bundles[deviceId].identityKey.substr(64, 128);
				console.info('Cryptocat.OMEMO', 'Setting up new Axolotl session with ' + username);
				bundles[deviceId].axolotl = Cryptocat.Axolotl.newSession(
					Cryptocat.Axolotl.newKeyPair(), iK, iDHK,
					bundles[deviceId].signedPreKey, bundles[deviceId].signedPreKeySignature,
					bundles[deviceId].preKeys[preKeyId], preKeyId
				);
			}
			var next = Cryptocat.Axolotl.send(
				Cryptocat.Me.settings.identityKey,
				bundles[deviceId].axolotl,
				ProScript.encoding.byteArrayToHexString(messageKey)
			);
			if (next.output.valid) {
				res.devices[deviceId] = next.output;
				Cryptocat.Me.settings.userBundles[
					username][deviceId
				].axolotl = next.them;
			}
		}};
		Cryptocat.XMPP.sendMessage(username, res);
		return true;
	};

	Cryptocat.OMEMO.receiveMessage = function(encrypted, retryCount, callback) {
		if (
			!hasProperty(Cryptocat.Me.settings.userBundles, encrypted.from) ||
			!hasProperty(Cryptocat.Me.settings.userBundles[encrypted.from], encrypted.sid)
		) {
			if (retryCount > 0) {
				setTimeout(function() {
					Cryptocat.OMEMO.receiveMessage(encrypted, retryCount - 1, callback);
				}, 2000);
			}
			return false;
		}
		var bundle = Cryptocat.Me.settings.userBundles[encrypted.from][encrypted.sid];
		if (
			!hasProperty(bundle, 'axolotl') ||
			!bundle.axolotl.established ||
			!(/^0+$/).test(encrypted.key.initEphemeralKey)
		) {
			var iK   = bundle.identityKey.substr(0,   64);
			var iDHK = bundle.identityKey.substr(64, 128);
			console.info('Cryptocat.OMEMO', 'Setting up new Axolotl session with ' + encrypted.from);
			bundle.axolotl = Cryptocat.Axolotl.newSession(
				Cryptocat.Me.settings.preKeys[encrypted.key.preKeyId],
				iK, iDHK, bundle.signedPreKey, bundle.signedPreKeySignature,
				ProScript.crypto.random32Bytes('o4'), parseInt(encrypted.key.preKeyId)
			);
		}
		var next = Cryptocat.Axolotl.recv(
			Cryptocat.Me.settings.identityKey,
			Cryptocat.Me.settings.signedPreKey,
			bundle.axolotl, {
				valid: true,
				ephemeralKey: ProScript.encoding.hexStringTo32ByteArray(
					encrypted.key.ephemeralKey
				),
				initEphemeralKey: ProScript.encoding.hexStringTo32ByteArray(
					encrypted.key.initEphemeralKey
				),
				ciphertext: encrypted.key.ciphertext,
				iv: ProScript.encoding.hexStringTo12ByteArray(
					encrypted.key.iv
				),
				tag: encrypted.key.tag,
				preKeyId: parseInt(encrypted.key.preKeyId)
			}
		);
		if (next.output.valid) {
			var message = ProScript.crypto.AESGCMDecrypt(
				ProScript.encoding.hexStringTo32ByteArray(next.plaintext),
				ProScript.encoding.hexStringTo12ByteArray(encrypted.iv),
				{
					ciphertext: encrypted.payload,
					tag: encrypted.tag
				},
			'')
			if (message.valid) {
				Cryptocat.Me.settings.userBundles[
					encrypted.from][encrypted.sid
				].axolotl = next.them;
				while (
					message.plaintext.length &&
					(message.plaintext.charCodeAt(message.plaintext.length - 1) === 0)
				) {
					message.plaintext = message.plaintext.slice(0, -1);
				}
				callback(message);
				return false;
			}
		}
		callback({
			plaintext: '',
			valid: false
		});
		return false;
	};
})();
