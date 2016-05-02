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
					(hasProperty(Cryptocat.Win.main.roster.buddies, username))
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
					var cE = stanza.utils.createElement;
					var sA = stanza.utils.setAttribute;
					var sT = stanza.utils.setText;
					var identityKey    = items.identityKey;
					var identityDHKey  = items.identityDHKey;
					var signedPreKey   = items.signedPreKey;
					var signedPreKeyId = items.signedPreKeyId;
					var sPKSignature   = items.signedPreKeySignature;
					var preKeys        = items.preKeys;
					var bATHS          = ProScript.encoding.byteArrayToHexString;
					var iKElement      = cE('', 'identityKey', '');
					var sPKElement     = cE('', 'signedPreKeyPublic', '');
					var sPKSElement    = cE('', 'signedPreKeySignature', '');
					var pKsElement     = cE('', 'prekeys', '');
					sT(iKElement,   bATHS(identityKey) + bATHS(identityDHKey));
					sA(iKElement, 'deviceName', items.deviceName);
					sA(iKElement, 'deviceIcon', items.deviceIcon + '');
					sT(sPKElement,  bATHS(signedPreKey));
					sA(sPKElement, 'signedPreKeyId', signedPreKeyId + '');
					sT(sPKSElement, sPKSignature);
					preKeys.forEach(function(preKey, preKeyId) {
						var pKElement = cE('', 'preKeyPublic', '');
						sA(pKElement, 'preKeyId', preKeyId + '');
						sT(pKElement, bATHS(preKey.pub));
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
					var cE = stanza.utils.createElement;
					var sA = stanza.utils.setAttribute;
					var sT = stanza.utils.setText;
					var devices  = items.devices;
					var payload  = items.payload;
					var sid      = items.sid;
					var bATHS    = ProScript.encoding.byteArrayToHexString;
					var hElement = cE('', 'header', '');
					var iElement = cE('', 'iv', '');
					var tElement = cE('', 'tag', '');
					var pElement = cE('', 'payload', '');
					sA(hElement, 'sid', sid);
					sT(iElement, payload.iv);
					sT(tElement, payload.tag);
					sT(pElement, payload.ciphertext);
					hElement.appendChild(iElement);
					hElement.appendChild(tElement);
					for (var deviceId in devices) { if (hasProperty(devices, deviceId)) {
						var kElement    = cE('', 'key', '');
						var _cElement   = cE('', 'ciphertext', '');
						var _eKElement  = cE('', 'ephemeralKey', '');
						var _iEKElement = cE('', 'initEphemeralKey', '');
						var _iElement   = cE('', 'iv', '');
						var _tElement   = cE('', 'tag', '');
						var _pKIElement = cE('', 'preKeyId', '');
						sA(kElement, 'rid', deviceId);
						sT(_cElement,   devices[deviceId].ciphertext);
						sT(_eKElement,  bATHS(devices[deviceId].ephemeralKey));
						sT(_iEKElement, bATHS(devices[deviceId].initEphemeralKey));
						sT(_iElement,   bATHS(devices[deviceId].iv));
						sT(_tElement,   devices[deviceId].tag);
						sT(_pKIElement, devices[deviceId].preKeyId);
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
		var bundle = {};
		if (
			hasProperty(data, 'item')             &&
			hasProperty(data.item, '0')           &&
			hasProperty(data.item[0], 'bundle')   &&
			hasProperty(data.item[0].bundle, '0')
		) {
			bundle = data.item[0].bundle[0];
		}
		else {
			return false;
		}
		return (
			Array.isArray(bundle.identityKey)                                      &&
			hasProperty(bundle.identityKey, '0')                                   &&
			hasProperty(bundle.identityKey[0], '$')                                &&
			hasProperty(bundle.identityKey[0], '_')                                &&
			hasProperty(bundle.identityKey[0].$, 'deviceName')                     &&
			hasProperty(bundle.identityKey[0].$, 'deviceIcon')                     &&
			Cryptocat.Patterns.deviceName.test(bundle.identityKey[0].$.deviceName) &&
			Cryptocat.Patterns.deviceIcon.test(bundle.identityKey[0].$.deviceIcon) &&
			Array.isArray(bundle.signedPreKeyPublic)                               &&
			hasProperty(bundle.signedPreKeyPublic, '0')                            &&
			hasProperty(bundle.signedPreKeyPublic[0], '$')                         &&
			hasProperty(bundle.signedPreKeyPublic[0], '_')                         &&
			hasProperty(bundle.signedPreKeyPublic[0].$, 'signedPreKeyId')          &&
			Array.isArray(bundle.signedPreKeySignature)                            &&
			hasProperty(bundle.signedPreKeySignature, '0')                         &&
			Array.isArray(bundle.prekeys)                                          &&
			hasProperty(bundle.prekeys, '0')                                       &&
			Array.isArray(bundle.prekeys[0].preKeyPublic)                          &&
			(bundle.prekeys[0].preKeyPublic.length === 100)                        &&
			Cryptocat.Patterns.hex64.test(bundle.identityKey[0]._)                 &&
			Cryptocat.Patterns.hex32.test(bundle.signedPreKeyPublic[0]._)          &&
			Cryptocat.Patterns.hex64.test(bundle.signedPreKeySignature[0])
		);
	};

	Cryptocat.OMEMO.setup = function(callback) {
		var deviceSetup = function() {
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
					deviceSetup();
				}
				if (response === 2) {
					Cryptocat.Win.main.beforeQuit();
				}
			});
		};
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
				deviceSetup();
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
			Cryptocat.XMPP.sendBundle();
			if (deviceIds.indexOf(Cryptocat.Me.settings.deviceId) < 0) {
				Cryptocat.XMPP.sendDeviceList(deviceIds.concat(
					[Cryptocat.Me.settings.deviceId]
				));
				setTimeout(function() {
					Cryptocat.XMPP.getDeviceList(username);
				}, 2000);
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
		Cryptocat.Win.updateDeviceManager(username);
		if (
			!hasProperty(Cryptocat.Win.deviceManager, username) &&
			(!isNewUser && isNewBundle)
		) {
			var diag = Cryptocat.Diag.message.updatedDevices;
			if (username === Cryptocat.Me.username) {
				diag = Cryptocat.Diag.message.updatedMyDevices;
			}
			diag(username, function(response) {
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
			if (
				!hasProperty(bundles[deviceId], 'axolotl') ||
				!hasProperty(bundles[deviceId].axolotl, 'myEphemeralKeyP4')
			) {
				var preKeyId = Cryptocat.OMEMO.selectPreKey(username, deviceId);
				var iK       = bundles[deviceId].identityKey.substr(0,   64);
				var iDHK     = bundles[deviceId].identityKey.substr(64, 128);
				console.info(
					'Cryptocat.OMEMO',
					'Setting up new Axolotl session with ' + username
				);
				bundles[deviceId].axolotl = Cryptocat.Axolotl.newSession(
					Cryptocat.Me.settings.signedPreKey,
					Cryptocat.Axolotl.newKeyPair(), iK, iDHK,
					bundles[deviceId].signedPreKey,
					bundles[deviceId].signedPreKeySignature,
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
				bundles[deviceId].axolotl = next.them;
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
			!hasProperty(bundle.axolotl, 'myEphemeralKeyP4') ||
			!(/^0+$/).test(encrypted.key.initEphemeralKey)
		) {
			var iK   = bundle.identityKey.substr(0,   64);
			var iDHK = bundle.identityKey.substr(64, 128);
			console.info(
				'Cryptocat.OMEMO',
				'Setting up new Axolotl session with ' + encrypted.from
			);
			bundle.axolotl = Cryptocat.Axolotl.newSession(
				Cryptocat.Me.settings.signedPreKey,
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
			bundle.axolotl = next.them;
			var message = ProScript.crypto.AESGCMDecrypt(
				ProScript.encoding.hexStringTo32ByteArray(next.plaintext),
				ProScript.encoding.hexStringTo12ByteArray(encrypted.iv),
				{
					ciphertext: encrypted.payload,
					tag: encrypted.tag
				},
			'')
			if (message.valid) {
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
