Cryptocat.XMPP = {};

(function() {
	'use strict';
	var client    = {};
	var handler   = {};
	var callbacks = {
		disconnected: {
			armed: false,
			payload: function() {}
		}
	};
	
	handler.raw = function(raw) {
		XML2JS.parseString(raw, function(err, res) {
			var fromUser  = Cryptocat.Me.username;
			var data      = [];
			var deviceIds = [];
			var preKeys   = [];
			var deviceId  = '';
			if (err) { return false; }
			if (
				hasProperty(res,        'message') &&
				hasProperty(res.message,  'event')
			) {
				data = res.message.event;
				if (
					hasProperty(res.message,      '$') &&
					hasProperty(res.message.$, 'from') &&
					Cryptocat.OMEMO.jidHasUsername(res.message.$.from).valid
				) {
					fromUser = Cryptocat.OMEMO.jidHasUsername(
						res.message.$.from
					).username;
				}
			}
			else if (
				hasProperty(res,        'iq') &&
				hasProperty(res.iq, 'pubsub')
			) {
				data = res.iq.pubsub;
				if (
					hasProperty(res.iq,      '$') &&
					hasProperty(res.iq.$, 'from') &&
					Cryptocat.OMEMO.jidHasUsername(res.iq.$.from).valid
				) {
					fromUser = Cryptocat.OMEMO.jidHasUsername(
						res.iq.$.from
					).username;
				}
			}
			else if (
				hasProperty(res,        'iq') &&
				hasProperty(res.iq.$, 'type') &&
				(res.iq.$.type === 'error')
			) {
				var deviceIds = Cryptocat.Me.settings.deviceIds;
				var deviceId  = Cryptocat.Me.settings.deviceId;
				if (deviceIds.indexOf(deviceId) < 0) {
					Cryptocat.XMPP.sendDeviceList(
						deviceIds.concat([deviceId])
					);
					Cryptocat.XMPP.sendBundle();
				}
				return false;
			}
			if (
				hasProperty(data,                  '0') &&
				hasProperty(data[0],           'items') &&
				hasProperty(data[0].items,         '0') &&
				hasProperty(data[0].items[0],      '$') &&
				hasProperty(data[0].items[0].$, 'node')
			) {
				data = data[0].items[0];
				if ((/^urn:xmpp:omemo:0:devicelist$/).test(data.$.node)) {
					if (	
						hasProperty(data,                   'item') &&
						hasProperty(data.item,                 '0') &&
						hasProperty(data.item[0],           'list') &&
						hasProperty(data.item[0].list,         '0')
					) {
						if (!Array.isArray(data.item[0].list[0].device)) {
							Cryptocat.OMEMO.onGetDeviceList(fromUser, []);
							return false;
						}
						data = data.item[0].list[0].device;
						for (var i = 0; i < data.length; i++) {
							if (
								hasProperty(data[i],    '$') &&
								hasProperty(data[i].$, 'id') &&
								Cryptocat.Patterns.hex32.test(data[i].$.id)
							) {
								deviceIds.push(data[i].$.id);
							}
						}
						Cryptocat.OMEMO.onGetDeviceList(fromUser, deviceIds);
					}
					else if (fromUser === Cryptocat.Me.username) {
						Cryptocat.XMPP.sendDeviceList(
							Cryptocat.Me.settings.deviceIds.concat(
								[Cryptocat.Me.settings.deviceId]
							)
						);
						Cryptocat.XMPP.sendBundle();
					}
				}
				else if (Cryptocat.OMEMO.nodeHasDeviceId(data.$.node).valid) {
					deviceId = Cryptocat.OMEMO.nodeHasDeviceId(data.$.node).deviceId;
					if (!Cryptocat.OMEMO.isProperBundle(data)) {
						return false;
					}
					data = data.item[0].bundle[0];
					preKeys = Cryptocat.OMEMO.extractPreKeys(
						data.prekeys[0].preKeyPublic
					);
					Cryptocat.OMEMO.onGetBundle(fromUser, deviceId, {
						identityKey:           data.identityKey[0]._,
						deviceName:            data.identityKey[0].$.deviceName,
						deviceIcon:            data.identityKey[0].$.deviceIcon,
						signedPreKey:          data.signedPreKeyPublic[0]._,
						signedPreKeyId:        data.signedPreKeyPublic[0].$.signedPreKeyId,
						signedPreKeySignature: data.signedPreKeySignature[0],
						preKeys:               preKeys
					});
				}
			}
		});
	};

	handler.error = function(error, username, password, callback) {
		console.info('Cryptocat.XMPP ERROR', error)
		client.disconnect();
		callback(false);
	};

	handler.connected = function(username, data, callback) {
		console.info('Cryptocat.XMPP CONNECTED', data.local);
		Cryptocat.Me.username = username;
		Cryptocat.OMEMO.setup(function() {
			Cryptocat.Me.connected = true;
			Cryptocat.XMPP.getDeviceList(username);
			Cryptocat.XMPP.sendBundle();
			client.getRoster();
			client.sendPresence();
			client.connectDate = Math.floor(Date.now() / 1000);
			callback(true);
		});
	};

	handler.disconnected = function() {
		Cryptocat.Me.connected = false;
		if (callbacks.disconnected.armed) {
			callbacks.disconnected.armed = false;
			callbacks.disconnected.payload();
		}
	};
	
	handler.encrypted = function(encrypted) {
		Cryptocat.OMEMO.receiveMessage(encrypted, 5, function(message) {
			if (!message.valid) {
				console.info(
					'Cryptocat.XMPP',
					'Indecipherable message from ' + encrypted.from
				);
				Cryptocat.OMEMO.rebuildDeviceSession(encrypted.from, encrypted.sid);
				Cryptocat.XMPP.deliverMessage(
					encrypted.from, {
						plaintext: ('This message could not be decrypted. ' +
							'You may want to ask your buddy to send it again.'),
						valid: message.valid,
						stamp: encrypted.stamp,
						offline: encrypted.offline
					}
				);
			}
			else {
				Cryptocat.XMPP.deliverMessage(
					encrypted.from, {
						plaintext: message.plaintext,
						valid: message.valid,
						stamp: encrypted.stamp,
						offline: encrypted.offline
					}
				);
			}
		});
	};

	handler.chatState = function(message) {
		var username = Cryptocat.OMEMO.jidHasUsername(message.from.bare);
		if (
			(/^(composing)|(paused)$/).test(message.chatState) &&
			username.valid &&
			hasProperty(Cryptocat.Win.chat, username.username)
		) {
			Cryptocat.Win.chat[username.username].webContents.send(
				'chat.theirChatState', message.chatState
			);
		}
	};

	handler.availability = function(data) {	
		var local = Cryptocat.OMEMO.jidHasUsername(data.from.bare);
		if (
			!local.valid                               ||
			(local.username === Cryptocat.Me.username)
		) {
			return false;
		}
		var s;
		(data.type === 'unavailable')? (s = 0) : (s = 2);
		if (
			(s === 0) &&
			hasProperty(Cryptocat.Me.settings.userBundles, local.username) &&
			Object.keys(Cryptocat.Me.settings.userBundles[local.username]).length
		) {
			s = 1;
		}
		else {
			Cryptocat.XMPP.getDeviceList(local.username);
		}
		client.subscribeToNode(
			local.username + '@crypto.cat', 'urn:xmpp:omemo:0:devicelist'
		);
		Cryptocat.XMPP.getDeviceList(local.username);
		Cryptocat.Win.main.roster.updateBuddyStatus(
			local.username, s, (
				Math.floor(Date.now() / 1000) > (client.connectDate + 10)
			)
		);
	};

	handler.roster = function(roster) {
		if (hasProperty(roster, 'items')) {
			Cryptocat.Win.main.roster.buildRoster(roster.items);
			for (var i = 0; i < roster.items.length; i++) {
				client.subscribeToNode(
					roster.items[i].jid.bare, 'urn:xmpp:omemo:0:devicelist'
				);
			}
		}
	};

	handler.subscribe = function(data) {
		if (!Cryptocat.Patterns.username.test(data.from.local)) {
			return false;
		}
		if (hasProperty(Cryptocat.Win.main.roster.buddies, data.from.local)) {
			client.acceptSubscription(data.from.bare);
			return false;
		}
		Cryptocat.Diag.message.addBuddyRequest(
			data.from.local, function(response) {
				if (response === 0) {
					Cryptocat.Win.main.roster.updateBuddyStatus(
						data.from.local, 0, false
					);
					client.acceptSubscription(data.from.bare);
					Cryptocat.XMPP.sendBuddyRequest(data.from.local);
				}
				if (response === 1) {
					client.denySubscription(data.from.bare);
				}
			}
		);
	};

	handler.unsubscribed = function(data) {
		var username = Cryptocat.OMEMO.jidHasUsername(data.from.bare);
		if (username.valid) {
			Cryptocat.Diag.message.buddyUnsubscribed(username.username);
			Cryptocat.XMPP.removeBuddy(username.username);
		}
	};

	Cryptocat.XMPP.login = function(username, password, callback) {
		console.info('Cryptocat.XMPP', 'Connecting as ' + username);
		client = XMPP.createClient({
			jid: username + '@crypto.cat',
			server: 'crypto.cat',
			credentials: {
				username: username,
				password: password,
				host: 'crypto.cat',
				serviceType: 'XMPP',
				serviceName: 'crypto.cat',
				realm: 'crypto.cat'
			},
			transport: 'websocket',
			wsURL: 'wss://crypto.cat:443/socket',
			useStreamManagement: true
		});
		client.use(Cryptocat.OMEMO.plugins.deviceList);
		client.use(Cryptocat.OMEMO.plugins.bundle);
		client.use(Cryptocat.OMEMO.plugins.encrypted);
		client.on('raw:incoming', function(raw) {
			handler.raw(raw);
		});
		client.on('raw:outgoing', function(raw) {
		});
		client.on('message:error',  function(error) {
			console.info('Cryptocat.XMPP MSG ERROR', error);
			// handler.error(error, username, password, callback)
		});
		client.on('presence:error',  function(error) {
			handler.error(error, username, password, callback)
		});
		client.on('session:error',  function(error) {
			handler.error(error, username, password, callback)
		});
		client.on('stream:error',  function(error) {
			handler.error(error, username, password, callback)
		});
		client.on('session:started', function(data) {
			handler.connected(username, data, callback);	
		});
		client.on('disconnected', function() {
			handler.disconnected();
		});
		client.on('message', function(message) {
			// handler.message(message);
		});
		client.on('chat:state', function(message) {
			handler.chatState(message);
		});
		client.on('encrypted', function(encrypted) {
			handler.encrypted(encrypted);
		});
		client.on('available', function(data) {
			handler.availability(data);
		});
		client.on('unavailable', function(data) {
			handler.availability(data);
		});
		client.on('roster:update', function(stanza) {
		});
		client.on('subscribe', function(data) {
			handler.subscribe(data);
		});
		client.on('unsubscribed', function(data) {
			handler.unsubscribed(data);
		});
		client.on('stanza', function(stanza) {
			if (
				(stanza.type === 'result') &&
				(hasProperty(stanza, 'roster'))
			) {
				handler.roster(stanza.roster);
			}
		});
		client.connect();
	};

	Cryptocat.XMPP.sendMessage = function(to, items) {
		client.sendMessage({
			type: 'chat',
			to: to + '@crypto.cat',
			encrypted: { encryptedItems: items },
			body: ''
		});
	};

	Cryptocat.XMPP.sendChatState = function(to, chatState) {
		client.sendMessage({
			type: 'chat',
			to: to + '@crypto.cat',
			chatState: chatState
		});
	};

	Cryptocat.XMPP.sendBuddyRequest = function(username) {
		Cryptocat.Win.main.roster.updateBuddyStatus(
			username, 0, false
		);
		client.subscribe(username + '@crypto.cat');
	};

	Cryptocat.XMPP.removeBuddy = function(username) {
		client.removeRosterItem(
			username + '@crypto.cat', function() {
				Cryptocat.Win.main.roster.removeBuddy(username);
			}
		);
	};

	Cryptocat.XMPP.sendDeviceList = function(deviceIds) {
		client.publish(
			Cryptocat.Me.username + '@crypto.cat',
			'urn:xmpp:omemo:0:devicelist',
			{ devicelist: { deviceIds: deviceIds } }
		);
	};

	Cryptocat.XMPP.changePassword = function(username, password) {
		client.sendIq({
			to: 'crypto.cat',
			type: 'set',
			register: {
				username: username,
				password: password
			}
		});
	};

	Cryptocat.XMPP.sendBundle = function() {
		client.publish(
			Cryptocat.Me.username + '@crypto.cat',
			'urn:xmpp:omemo:0:bundles:' + Cryptocat.Me.settings.deviceId,
			{ bundle: { bundleItems: {
				identityKey: Cryptocat.Me.settings.identityKey.pub,
				deviceName: Cryptocat.Me.settings.deviceName,
				deviceIcon: Cryptocat.Me.settings.deviceIcon,
				identityDHKey: Cryptocat.Me.settings.identityDHKey,
				signedPreKey: Cryptocat.Me.settings.signedPreKey.pub,
				signedPreKeySignature: Cryptocat.Me.settings.signedPreKeySignature,
				signedPreKeyId: Cryptocat.Me.settings.signedPreKeyId,
				preKeys: Cryptocat.Me.settings.preKeys
			} } }
		);
	};

	Cryptocat.XMPP.getDeviceList = function(username) {
		client.getItems(
			username + '@crypto.cat',
			'urn:xmpp:omemo:0:devicelist'
		);
	};

	Cryptocat.XMPP.getBundle = function(username, deviceId) {
		client.subscribeToNode(
			username + '@crypto.cat',
			'urn:xmpp:omemo:0:bundles:' + deviceId,
			function(err) {
				client.getItems(
					username + '@crypto.cat',
					'urn:xmpp:omemo:0:bundles:' + deviceId
				)
			}
		);
	};

	Cryptocat.XMPP.deliverMessage = function(username, info) {
		var sendToWindow = function() {
			Cryptocat.Win.chat[username].webContents.send(
				'chat.receiveMessage', info
			)
			Cryptocat.Notify.playSound('message');
			if (!Cryptocat.Win.chat[username].isFocused()) {
				var notifText = info.plaintext;
				if (Cryptocat.Patterns.sticker.match(notifText)) {
					notifText = username + ' sent you a cat sticker!';
				}
				if (Cryptocat.Patterns.file.match(notifText)) {
					notifText = username + ' sent you a file.';
				}
				Cryptocat.Notify.showNotification(
					username, notifText, function() {
						Cryptocat.Win.chat[username].focus();
					}
				);
			}
		};
		if (!info.plaintext.length) { return false }
		if (hasProperty(Cryptocat.Win.chat, username)) {
			if (Cryptocat.Win.chat[username].webContents.isLoading()) {
				setTimeout(function() {
					Cryptocat.XMPP.deliverMessage(username, info)
				}, 500);
			}
			else { sendToWindow(); }
		}
		else {
			Cryptocat.Win.create.chat(username, sendToWindow);
		}
	};

	Cryptocat.XMPP.disconnect = function(callback) {
		Cryptocat.Me.username = '';
		Cryptocat.Me.connected = false;
		client.sendPresence({
			type: 'unavailable'
		});
		if (typeof(callback) === 'function') {
			callbacks.disconnected = {
				armed: true,
				payload: callback
			}
		}
		client.disconnect();
	};

})();
