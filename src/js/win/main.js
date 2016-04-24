Cryptocat.Win = {
	main:          {},
	chat:          {},
	chatRetainer:  [],
	deviceManager: {},
	create:        {}
};

window.addEventListener('load', function(e) {	
	'use strict';

	var mainLogin = React.createClass({
		displayName: 'mainLogin',
		getInitialState: function() {
			return {
				username: '',
				password: '',
				disabled: false,
				display: 'block',
				reconn: 5000
			};
		},
		componentDidMount: function() {
			return true;
		},
		onChangeUsername: function(e) {
			this.setState({username: e.target.value.toLowerCase()});
		},
		onChangePassword: function(e) {
			this.setState({password: e.target.value});
		},
		onSubmit: function(e) {
			var _t = this;
			if (this.validInputs()) {
				this.setState({disabled: true});
				Cryptocat.XMPP.login(
					this.state.username, this.state.password,
					function(s) { (s? _t.onConnect() : _t.onDisconnect()) }
				);
			}
			else {
				Cryptocat.Diag.error.loginInvalid();
			}
			e.preventDefault();
			return false;
		},
		validInputs: function() {
			if (
				Cryptocat.Patterns.username.test(this.state.username) &&
				Cryptocat.Patterns.password.test(this.state.password)
			) {
				return true	
			}
			return false
		},
		onConnect: function() {
			this.setState({
				display: 'none'
			});
			Cryptocat.Win.main.roster = ReactDOM.render(
				React.createElement(mainRoster, null),
				document.getElementById('renderB')
			);
			Cryptocat.Notify.playSound('loggedIn');
			IPCRenderer.send('app.updateMenuSettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds: Cryptocat.Me.settings.sounds,
				typing: Cryptocat.Me.settings.typing
			});
		},
		onAuthFailed: function() {
			Cryptocat.Diag.error.loginInvalid();
			this.setState({
				disabled: false,
				display: 'block'
			});
			ReactDOM.unmountComponentAtNode(
				document.getElementById('renderB')
			);
		},
		onDisconnect: function() {
			var _t = this;
			if (!Cryptocat.Me.connected) {
				return false;
			}
			setTimeout(function() {
				if (!Cryptocat.Me.connected) {
					Cryptocat.XMPP.disconnect(function() {
						_t.onSubmit();
					});
					_t.setState({
						reconn: _t.state.reconn + 5000
					});
					return false;
				}
				_t.setState({
					reconn: 5000
				});
			}, _t.state.reconn);
			Cryptocat.Me.connected = false;
		},
		onLogOut: function() {
			Cryptocat.Me = Object.assign({}, Cryptocat.emptyMe);
			this.setState({
				disabled: false,
				display: 'block',
				password: ''
			});
			ReactDOM.unmountComponentAtNode(
				document.getElementById('renderB')
			);
		},
		render: function() {
			return React.createElement('form', {
				className: 'mainLogin',
				onSubmit: this.onSubmit,
				style: {
					display: this.state.display
				}
			}, [
				React.createElement('img', {
					key: 0,
					src: '../img/logo/logo.png',
					alt: 'Cryptocat',
					className: 'logo',
					draggable: 'false'
				}),
				React.createElement('input', {
					key: 1,
					type: 'text',
					placeholder: 'Username',
					value: this.state.username,
					onChange: this.onChangeUsername,
					autoFocus: true,
					disabled: this.state.disabled
				}),
				React.createElement('input', {
					key: 2,
					type: 'password',
					placeholder: 'Password',
					value: this.state.password,
					onChange: this.onChangePassword,
					disabled: this.state.disabled
				}),
				React.createElement('input', {
					key: 3,
					type: 'submit',
					value: 'Login',
					disabled: this.state.disabled
				}),
				React.createElement('br', {
					key: 4,
				}),
				React.createElement('input', {
					key: 5,
					className: 'create',
					type: 'button',
					value: 'Create Account',
					onClick: function() {
						Remote.shell.openExternal('https://crypto.cat/create');
					}
				}),
				React.createElement('span', {
					key: 6,
					className: 'version',
				}, Cryptocat.Version + ', Beta software.')
			]);
		}
	});

	var mainRosterBuddy = React.createClass({
		displayName: 'mainRosterBuddy',
		getInitialState: function() {
			return {
				visible: true
			};
		},
		componentDidMount: function() {
			return true;
		},
		onClick: function() {
			Cryptocat.Win.create.chat(this.props.username);
		},
		onContextMenu: function(e) {
			e.preventDefault();
			var _t = this;
			(Remote.Menu.buildFromTemplate([
				{
					label: 'Open Chat',
					click: function() { _t.onClick(); }
				}, {
					label: 'View Devices',
					click: function() {
						Cryptocat.Win.create.deviceManager(_t.props.username);
					}
				}, {
					type: 'separator'
				}, {
					label: 'Remove Buddy',
					click: function() {
						Cryptocat.Diag.message.removeBuddyConfirm(function(response) {
							if (response === 0) {
								Cryptocat.XMPP.removeBuddy(_t.props.username);
							}
						});
					}
				}
			])).popup(Remote.getCurrentWindow());
		},
		render: function() {
			return React.createElement('div', {
				key: 0,
				className: 'mainRosterBuddy',
				'data-status': this.props.status,
				'data-visible': this.state.visible,
				title: 'Right click for buddy options',
				onClick: this.onClick,
				onContextMenu: this.onContextMenu
			}, [
				React.createElement('span', {
					key: 1,
					className: 'mainRosterBuddyStatus',
				}),
				this.props.username
			])
		}
	});

	var mainRoster = React.createClass({
		displayName: 'mainRoster',
		getInitialState: function() {
			return {
				buddies: {},
				filter: ''
			};
		},
		componentDidMount: function() {
			return true;
		},
		buildRoster: function(rosterItems) {
			var newBuddies = {};
			var userBundles = Cryptocat.Me.settings.userBundles;
			var _t = this;
			rosterItems.forEach(function(item) {
				var status = 0;
				if (
					hasProperty(userBundles, item.jid.local) &&
					Object.keys(userBundles[item.jid.local]).length
				) {
					status = 1;
				}
				var buddy = React.createElement(mainRosterBuddy, {
					key:          item.jid.local,
					username:     item.jid.local,
					subscription: item.subscription,
					status:       status,
					ref:          function(b) {
						_t.buddies[item.jid.local] = b;
					}
				});
				newBuddies[item.jid.local] = buddy;
			})
			this.setState({buddies: newBuddies})
		},
		updateBuddyStatus: function(username, status, notify) {
			var newBuddies = this.state.buddies;
			var _t = this;
			newBuddies[username] = React.createElement(mainRosterBuddy, {
				key:          username,
				username:     username,
				subscription: '',
				status:       status,
				ref:          function(b) {
					_t.buddies[username] = b;
				}
			}, null);
			this.setState({buddies: newBuddies});
			if (notify && (status === 2)) {
				Cryptocat.Notify.showNotification(
					username + ' is online.',
					'Click here to chat with them.',
					function() {
						Cryptocat.Win.create.chat(username);
					}
				);
				Cryptocat.Notify.playSound('buddyOnline');
			}
			if (hasProperty(Cryptocat.Win.chat, username)) {
				Cryptocat.Win.chat[username].webContents.send(
					'chat.status', status
				);
			}
		},
		getBuddyStatus: function(username) {
			return this.buddies[username].props.status;
		},
		removeBuddy: function(username) {
			var _t = this;
			var newBuddies = _t.state.buddies;
			if (hasProperty(newBuddies, username)) {
				delete newBuddies[username];
				this.setState({buddies: newBuddies}, function() {
					delete _t.buddies[username];
					delete Cryptocat.Me.settings.userBundles[username];
				});
			}
		},
		onChangeFilter: function(e) {
			var _t = this;
			var f  = e.target.value.toLowerCase();
			_t.setState({filter: f}, function() {
				for (var b in _t.buddies) {
					if (hasProperty(_t.buddies, b)) {
						_t.buddies[b].setState({
							visible: (_t.buddies[b].props
								.username.indexOf(f) == 0
							)
						});
					}
				}
			});
		},
		buddies: {},
		render: function() {
			var buddiesArrays = [[], [], []];
			for (var p in this.state.buddies) {
				if (hasProperty(this.state.buddies, p)) {
					var b = this.state.buddies[p];
					buddiesArrays[
						Math.abs(b.props.status - 2)
					].push(b);
				}
			}
			for (var i = 0; i < 3; i++) {
				buddiesArrays[i].sort(function(a, b) {
					if (a.props.username < b.props.username) {
						return -1
					} else { return +1 }; return 0
				});
			}
			buddiesArrays = buddiesArrays[0].concat(
				buddiesArrays[1].concat(
					buddiesArrays[2]
				)
			);
			return React.createElement('div', {
				key: 0,
				className: 'mainRoster',
				onSubmit: this.onSubmit
			}, [
				React.createElement('input', {
					key: 1,
					type: 'text',
					className: 'mainRosterFilter',
					placeholder: 'Filter...',
					value: this.state.filter,
					onChange: this.onChangeFilter
				}),
				React.createElement('div', {
					key: 2,
					className: 'mainRosterIntro',
					'data-visible': !buddiesArrays.length
				}, React.createElement('h2', {
					key: 3
				}, 'Welcome.'),
				React.createElement('p', {
					key: 4
				}, ''))
			].concat(buddiesArrays));
		}
	});

	Cryptocat.Win.create.updateDownloader = function() {
		var updateDownloader = new Remote.BrowserWindow({
			width: 330,
			height: 160,
			title: 'Downloading Update...',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false
		});
		updateDownloader.setMenu(null);
		updateDownloader.webContents.on('did-finish-load', function() {
			updateDownloader.show();
		});
		updateDownloader.loadURL(
			'file://' + __dirname + '/updateDownloader.html'
		);
	};

	Cryptocat.Win.create.chat = function(username, callback) {
		if (hasProperty(Cryptocat.Win.chat, username)) {
			Cryptocat.Win.chat[username].focus();
			return false;
		}
		if (!Cryptocat.Win.chatRetainer.length) {
			var chatRetainer = new Remote.BrowserWindow({
				width: 450,
				height: 450,
				minWidth: 450,
				minHeight: 150,
				show: false
			});
			Cryptocat.Win.chatRetainer.push(chatRetainer);
			chatRetainer.loadURL('file://' + __dirname + '/chat.html');
		}
		Cryptocat.XMPP.getDeviceList(username);
		Cryptocat.Win.chat[username] = Cryptocat.Win.chatRetainer[0];
		Cryptocat.Win.chatRetainer.splice(0, 1);
		Cryptocat.Win.chat[username].on('closed', function() {
			delete Cryptocat.Win.chat[username];
		});
		Cryptocat.Win.chat[username].webContents.send('chat.init', {
			myUsername: Cryptocat.Me.username,
			theirUsername: username,
			status: Cryptocat.Win.main.roster.getBuddyStatus(username)
		});
		Cryptocat.Win.chat[username].setTitle('Chat with ' + username);
		if (typeof(callback) === 'function') { callback() }
		Cryptocat.Win.chat[username].show();
		if (Cryptocat.Win.chatRetainer.length < 2) {
			var chatRetainer = new Remote.BrowserWindow({
				width: 450,
				height: 450,
				minWidth: 450,
				minHeight: 150,
				show: false
			});
			Cryptocat.Win.chatRetainer.push(chatRetainer);
			chatRetainer.loadURL('file://' + __dirname + '/chat.html');
		}
	};

	Cryptocat.Win.create.addBuddy = function() {
		var addBuddyWindow = new Remote.BrowserWindow({
			width: 320,
			height: 200,
			title: 'Add Buddy',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false
		});
		addBuddyWindow.setMenu(null);
		addBuddyWindow.webContents.on('did-finish-load', function() {
			addBuddyWindow.show();
		});
		addBuddyWindow.loadURL('file://' + __dirname + '/addBuddy.html');
	};

	Cryptocat.Win.create.changePassword = function() {
		var changePasswordWindow = new Remote.BrowserWindow({
			width: 310,
			height: 200,
			title: 'Change Password',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false
		});
		changePasswordWindow.setMenu(null);
		changePasswordWindow.webContents.on('did-finish-load', function() {
			changePasswordWindow.show();
		});
		changePasswordWindow.loadURL(
			'file://' + __dirname + '/changePassword.html'
		);
	}

	Cryptocat.Win.create.addDevice = function() {
		var addDeviceWindow = new Remote.BrowserWindow({
			width: 400,
			height: 265,
			title: 'Add Device',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false
		});
		addDeviceWindow.setMenu(null);
		addDeviceWindow.webContents.on('did-finish-load', function() {
			addDeviceWindow.show();
		});
		addDeviceWindow.loadURL('file://' + __dirname + '/addDevice.html');
	};

	Cryptocat.Win.create.deviceManager = function(username) {
		if (hasProperty(Cryptocat.Win.deviceManager, username)) {
			Cryptocat.Win.deviceManager[username].focus();
			return false;
		}
		Cryptocat.Win.deviceManager[username] = new Remote.BrowserWindow({
			width: 470,
			height: 250,
			title: 'Manage Devices',
			resizable: false,
			minimizable: true,
			maximizable: false,
			fullscreenable: false,
			show: false
		});
		Cryptocat.Win.deviceManager[username].webContents.on('did-finish-load', function() {
			Cryptocat.Win.updateDeviceManager(username);
			Cryptocat.XMPP.getDeviceList(username);
			Cryptocat.Win.deviceManager[username].show();
		});
		Cryptocat.Win.deviceManager[username].on('closed', function() {
			delete Cryptocat.Win.deviceManager[username];
		});
		Cryptocat.Win.deviceManager[username].setMenu(null);
		Cryptocat.Win.deviceManager[username].loadURL(
			'file://' + __dirname + '/deviceManager.html'
		);
	};

	Cryptocat.Win.updateDeviceManager = function(username) {
		if (!hasProperty(Cryptocat.Win.deviceManager, username)) {
			return false;
		}
		var devices = [];
		var userBundles = Cryptocat.Me.settings.userBundles[username];
		for (var deviceId in userBundles) { if (hasProperty(userBundles, deviceId)) {
			devices.push({
				deviceId: deviceId,
				deviceName: userBundles[deviceId].deviceName,
				deviceIcon: userBundles[deviceId].deviceIcon,
				deviceFingerprint: Cryptocat.OMEMO.deviceFingerprint(
					username, deviceId,
					userBundles[deviceId].deviceName,
					userBundles[deviceId].deviceIcon,
					userBundles[deviceId].identityKey
				)
			});
		}};
		Cryptocat.Win.deviceManager[username].webContents.send(
			'deviceManager.update', {
				username: username,
				devices: devices,
				mine: (username === Cryptocat.Me.username)
			}
		);
	};

	Cryptocat.Win.main.login = ReactDOM.render(
		React.createElement(mainLogin, null),
		document.getElementById('renderA')
	);

	Cryptocat.Win.main.beforeQuit = function() {
		var position = Remote.getCurrentWindow().getPosition();
		var size     = Remote.getCurrentWindow().getSize();
		Cryptocat.Storage.updateCommon({
			mainWindowBounds: {
				x:      position[0],
				y:      position[1],
				width:  size[0],
				height: size[1]
			}
		}, function() {
			for (var username in Cryptocat.Win.chat) {
				if (hasProperty(Cryptocat.Win.chat, username)) {
					Cryptocat.Win.chat[username].destroy();
					delete Cryptocat.Win.chat[username];
				}
			}
			if (Cryptocat.Me.connected) {
				Cryptocat.XMPP.disconnect(function() {
					IPCRenderer.sendSync('app.quit');
				});
				setTimeout(function() {
					Cryptocat.Me.connected = false;
					Cryptocat.Storage.updateUser(
						Cryptocat.Me.username,
						Cryptocat.Me.settings,
						function() {
							IPCRenderer.sendSync('app.quit');
						}
					);
				}, 5000);
			}
			else {
				IPCRenderer.sendSync('app.quit');
			}
		});
	};
	
	IPCRenderer.on('chat.sendMessage', function(e, to, message) {
		Cryptocat.OMEMO.sendMessage(to, message)
	});

	IPCRenderer.on('chat.myChatState', function(e, to, chatState) {
		if (Cryptocat.Me.settings.typing) {
			Cryptocat.XMPP.sendChatState(to, chatState);
		}
	});

	IPCRenderer.on('addBuddy.create', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Win.create.addBuddy();
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('deviceManager.create', function(e, username) {
		if (Cryptocat.Me.connected) {
			if (!username || !username.length) {
				username = Cryptocat.Me.username;
			}
			Cryptocat.Win.create.deviceManager(username);
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('changePassword.create', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Win.create.changePassword();
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('addBuddy.sendRequest', function(e, username) {
		if (Cryptocat.Me.connected) {
			if (username === Cryptocat.Me.username) {
				Cryptocat.Diag.error.addBuddySelf();
			}
			else {
				Cryptocat.XMPP.sendBuddyRequest(username);
				Cryptocat.Diag.message.addBuddySuccess();
			}
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('changePassword.changePassword', function(e, password) {
		if (Cryptocat.Me.connected) {
			Cryptocat.XMPP.changePassword(Cryptocat.Me.username, password);
			Cryptocat.Diag.message.changePasswordSuccess();
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('addDevice.addDevice', function(e, name, icon) {
		Cryptocat.OMEMO.onAddDevice(name, icon);
	});

	IPCRenderer.on('deviceManager.removeDevice', function(e, deviceId) {
		if (deviceId === Cryptocat.Me.settings.deviceId) {
			Cryptocat.Diag.message.removeThisDevice(function(response) {
				if (response === 0) {
					var index = Cryptocat.Me.settings.deviceIds.indexOf(
						deviceId
					);
					if (index >= 0) {
						Cryptocat.Me.settings.deviceIds.splice(index, 1);
					}
					Cryptocat.XMPP.sendDeviceList(
						Cryptocat.Me.settings.deviceIds
					);
					Cryptocat.XMPP.disconnect(function() {
						Cryptocat.Storage.deleteUser(
							Cryptocat.Me.username,
							function() {
								Cryptocat.Win.main.beforeQuit();
							}
						);
					});
				}
			});
		}
		else {
			Cryptocat.Diag.message.removeDevice(function(response) {
				if (response === 0) {
					var index = Cryptocat.Me.settings.deviceIds.indexOf(
						deviceId
					);
					if (index >= 0) {
						Cryptocat.Me.settings.deviceIds.splice(index, 1);
					}
					Cryptocat.XMPP.sendDeviceList(
						Cryptocat.Me.settings.deviceIds
					);
					Cryptocat.Storage.updateUser(Cryptocat.Me.username, {
						deviceIds: Cryptocat.Me.settings.deviceIds
					}, function() {});
					setTimeout(function() {
						Cryptocat.XMPP.getDeviceList(
							Cryptocat.Me.username
						);
					}, 1000);
				}
			});
		}
	});

	IPCRenderer.on('aboutBox.create', function(e) {
		Cryptocat.Diag.message.about();
	});

	IPCRenderer.on('main.updateNotifySetting', function(e, notify) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Me.settings.notify = notify;
			IPCRenderer.send('app.updateMenuSettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds: Cryptocat.Me.settings.sounds,
				typing: Cryptocat.Me.settings.typing
			});
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.updateSoundsSetting', function(e, sounds) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Me.settings.sounds = sounds;
			IPCRenderer.send('app.updateMenuSettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds: Cryptocat.Me.settings.sounds,
				typing: Cryptocat.Me.settings.typing
			});
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.updateTypingSetting', function(e, typing) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Me.settings.typing = typing;
			IPCRenderer.send('app.updateMenuSettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds: Cryptocat.Me.settings.sounds,
				typing: Cryptocat.Me.settings.typing
			});
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.logOut', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.XMPP.disconnect(function() {
				Cryptocat.Win.main.login.onLogOut();
			});
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.deleteAccount', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Diag.message.deleteAccount(
				Cryptocat.Me.username, function(response) {
					if (response === 1) {
						Remote.shell.openExternal(
							'https://crypto.cat/help.html#deleteAccount'
						);
					}
					if (response === 2) {
						Cryptocat.XMPP.deleteAccount(
							Cryptocat.Me.username
						);
					}
				}
			);
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.checkForUpdates', function(e) {
		Cryptocat.Update.check(function() {
			Cryptocat.Diag.message.isLatest(
				Cryptocat.Version
			);
		});
	});

	IPCRenderer.on('main.beforeQuit', function(e) {
		Cryptocat.Win.main.beforeQuit();
	});

	Cryptocat.Storage.getCommon(function(err, common) {
		var screenRes = Remote.screen.getPrimaryDisplay().size;
		if (
			common &&
			(screenRes.width  > common.mainWindowBounds.x) &&
			(screenRes.height > common.mainWindowBounds.y)
		) {
			Remote.getCurrentWindow().setPosition(
				common.mainWindowBounds.x,
				common.mainWindowBounds.y
			);
			Remote.getCurrentWindow().setSize(
				common.mainWindowBounds.width,
				common.mainWindowBounds.height
			);
			Remote.getCurrentWindow().show();
		}
		else {	
			Remote.getCurrentWindow().show();
		}
	});

	while (Cryptocat.Win.chatRetainer.length < 2) {
		var chatRetainer = new Remote.BrowserWindow({
			width: 450,
			height: 450,
			minWidth: 450,
			minHeight: 150,
			show: false
		});
		Cryptocat.Win.chatRetainer.push(chatRetainer);
		chatRetainer.loadURL('file://' + __dirname + '/chat.html');
	};

});

