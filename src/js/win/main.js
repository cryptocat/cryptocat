Cryptocat.Win = {
	main:          {},
	chat:          {},
	deviceManager: {},
	create:        {}
};

window.addEventListener('load', function(e) {	
	'use strict';
	var mainLogin = React.createClass({
		displayName: 'mainLogin',
		getInitialState: function() {
			return {
				username: '', password: '',
				disabled: false
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
			this.setState({disabled: true});
			if (this.validInputs()) {
				Cryptocat.XMPP.login(
					this.state.username, this.state.password,
					function(s) { (s? _t.onSuccess() : _t.onError()) }
				);
			}
			else {
				_t.onError();
			}
			e.preventDefault();
			return false;
		},
		validInputs: function() {
			if (
				Cryptocat.Patterns.username.test(this.state.username) &&
				(this.state.password.length >= 2) 
			) {
				return true	
			}
			return false
		},
		onSuccess: function() {
			ReactDOM.unmountComponentAtNode(
				document.getElementById('mainWindow')
			);
			Cryptocat.Win.main.roster = ReactDOM.render(
				React.createElement(mainRoster, null),
				document.getElementById('mainWindow')
			);
			Cryptocat.Notify.playSound('loggedIn');
			IPCRenderer.sendSync('app.updateTraySettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds:  Cryptocat.Me.settings.sounds
			});
		},
		onError: function() {
			Cryptocat.Diag.error.loginError()
			this.setState({disabled: false});
		},
		render: function() {
			return React.createElement('form', {
				className: 'mainLogin',
				onSubmit: this.onSubmit
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
					autoFocus: true
				}),
				React.createElement('input', {
					key: 2,
					type: 'password',
					placeholder: 'Password',
					value: this.state.password,
					onChange: this.onChangePassword
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
			var _t = this;
			var menu = new Remote.Menu();
			menu.append(new Remote.MenuItem({
				label: 'Open Chat',
				click: function() { _t.onClick(); }
			}));
			menu.append(new Remote.MenuItem({
				label: 'View Devices',
				click: function() {
					Cryptocat.Win.create.deviceManager(_t.props.username);
				}
			}));
			menu.append(new Remote.MenuItem({
				type: 'separator'
			}));
			menu.append(new Remote.MenuItem({
				label: 'Remove Buddy',
				click: function() {
					Cryptocat.Diag.message.removeBuddyConfirm(function(response) {
						if (response === 0) {
							Cryptocat.XMPP.removeBuddy(_t.props.username);
						}
					});
				}
			}));
			e.preventDefault();
			menu.popup();
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
				}, null);
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
				}, 'Your buddy list is empty. Add your first buddy by pressing Alt+A.'))
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
			fullscreenable: false
		});
		updateDownloader.setMenu(null);
		updateDownloader.loadURL('file://' + __dirname + '/updateDownloader.html');
	};

	Cryptocat.Win.create.chat = function(username, callback) {
		if (hasProperty(Cryptocat.Win.chat, username)) {
			Cryptocat.Win.chat[username].focus();
			return false;
		}
		Cryptocat.XMPP.getDeviceList(username);
		Cryptocat.Win.chat[username] = new Remote.BrowserWindow({
			width: 450,
			height: 450,
			minWidth: 450,
			minHeight: 450,
			title: 'Chat with ' + username,
		});
		Cryptocat.Win.chat[username].on('closed', function() {
			delete Cryptocat.Win.chat[username];
		});
		Cryptocat.Win.chat[username].webContents.on('dom-ready', function() {
			Cryptocat.Win.chat[username].webContents.send('chat.init', {
				myUsername: Cryptocat.Me.username,
				theirUsername: username,
				status: Cryptocat.Win.main.roster.getBuddyStatus(username)
			});
			if (typeof(callback) === 'function') { callback() }
		});
		Cryptocat.Win.chat[username].setMenu(Remote.Menu.buildFromTemplate([
			{
				label: 'Buddy',
				submenu: [
					{
						label: 'View Devices',
						click: function() {
							Cryptocat.Win.create.deviceManager(username);
						}
					},
					{
						type: 'separator'
					},
					{
						label: 'Close',
						accelerator: 'CmdOrCtrl+W',
						click: function() {
							Cryptocat.Win.chat[username].close();
						}
					}
				]
			},
			{
				label: 'Edit',
				submenu: [{
					label: 'Undo',
					accelerator: 'CmdOrCtrl+Z',
					role: 'undo'
				}, {
					label: 'Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					role: 'redo'
				}, {
					type: 'separator'
				}, {
					label: 'Cut',
					accelerator: 'CmdOrCtrl+X',
					role: 'cut'
				}, {
					label: 'Copy',
					accelerator: 'CmdOrCtrl+C',
					role: 'copy'
				}, {
					label: 'Paste',
					accelerator: 'CmdOrCtrl+V',
					role: 'paste'
				}, {
					label: 'Select All',
					accelerator: 'CmdOrCtrl+A',
					role: 'selectall'
				}]
			},
			{
				label: 'Help',
				role: 'help',
				submenu: [{
					label: 'Getting Started',
					click: function() {
						Remote.shell.openExternal(
							'https://crypto.cat/help.html'
						)
					}
				},
				/*{label:'Developer',click:function(i,f){f.toggleDevTools();}},*/
				{
					label: 'Report a Bug',
					click: function() {
						Remote.shell.openExternal(
							'https://github.com/cryptocat/cryptocat/issues/'
						)
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'About Cryptocat',
					click: function() {
						Cryptocat.Diag.message.about();
					}
				}
				]
			}
		]));
		Cryptocat.Win.chat[username].loadURL('file://' + __dirname + '/chat.html');
	};

	Cryptocat.Win.create.addBuddy = function() {
		var addBuddyWindow = new Remote.BrowserWindow({
			width: 320,
			height: 200,
			title: 'Add Buddy',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false
		});
		addBuddyWindow.setMenu(null);
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
			fullscreenable: false
		});
		changePasswordWindow.setMenu(null);
		changePasswordWindow.loadURL('file://' + __dirname + '/changePassword.html');
	}

	Cryptocat.Win.create.addDevice = function() {
		var addDeviceWindow = new Remote.BrowserWindow({
			width: 400,
			height: 265,
			title: 'Add Device',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false
		});
		addDeviceWindow.setMenu(null);
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
			fullscreenable: false
		});
		Cryptocat.Win.deviceManager[username].webContents.on('dom-ready', function() {
			Cryptocat.XMPP.getDeviceList(username);
		});
		Cryptocat.Win.deviceManager[username].on('closed', function() {
			delete Cryptocat.Win.deviceManager[username];
		});
		Cryptocat.Win.deviceManager[username].setMenu(null);
		Cryptocat.Win.deviceManager[username].loadURL('file://' + __dirname + '/deviceManager.html');
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
		Cryptocat.Win.deviceManager[username].webContents.send('deviceManager.update', {
			username: username,
			devices: devices,
			mine: (username === Cryptocat.Me.username)
		});
	};

	Cryptocat.Win.main.login = ReactDOM.render(
		React.createElement(mainLogin, null),
		document.getElementById('mainWindow')
	);

	Cryptocat.Win.main.beforeQuit = function() {
		for (var username in Cryptocat.Win.chat) {
			if (hasProperty(Cryptocat.Win.chat, username)) {
				Cryptocat.Win.chat[username].destroy();
				delete Cryptocat.Win.chat[username];
			}
		}
		if (Cryptocat.Me.connected) {
			Cryptocat.Storage.updateUser(
				Cryptocat.Me.username,
				Cryptocat.Me.settings,
				function() {
					Cryptocat.XMPP.disconnect(function() {
						IPCRenderer.sendSync('app.quit');
					});
				}
			);
		}
		else {
			IPCRenderer.sendSync('app.quit');
		}
	};

	IPCRenderer.on('chat.sendMessage', function(e, to, message) {
		Cryptocat.OMEMO.sendMessage(to, message)
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
					var index = Cryptocat.Me.settings.deviceIds.indexOf(deviceId);
					if (index >= 0) {
						Cryptocat.Me.settings.deviceIds.splice(index, 1);
					}
					Cryptocat.XMPP.sendDeviceList(
						Cryptocat.Me.settings.deviceIds
					);
					Cryptocat.Storage.deleteUser(
						Cryptocat.Me.username,
						function() {
							Cryptocat.XMPP.disconnect(function() {
								Cryptocat.Win.main.beforeQuit();
							});
						}
					);
				}
			});
		}
		else {
			Cryptocat.Diag.message.removeDevice(function(response) {
				if (response === 0) {
					var index = Cryptocat.Me.settings.deviceIds.indexOf(deviceId);
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
		}
		else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.updateSoundsSetting', function(e, sounds) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Me.settings.sounds = sounds;
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
});

window.addEventListener('beforeunload', function(e) {
});

document.addEventListener('dragover', function(e) {
	e.preventDefault();
	return false;
}, false);

document.addEventListener('drop', function(e) {
	e.preventDefault();
	return false;
}, false);

