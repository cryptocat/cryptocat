'use strict';

Cryptocat.Win = {
	main: {},
	chat: {},
	chatRetainer: [],
	deviceManager: {},
	create: {}
};
window.addEventListener('load', function(e) {
	var renderWindowHeight = function(h) {
		if (process.platform === 'win32') {
			return h + 40;
		}
		return h;
	};

	var spawnChatWindow = function() {
		var chatWindow = new Remote.BrowserWindow({
			width: 470,
			minWidth: 470,
			height: renderWindowHeight(470),
			minHeight: renderWindowHeight(150),
			show: false,
			autoHideMenuBar: false,
			webPreferences: {
				nodeIntegration: false,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		chatWindow.loadURL(
			Path.join('file://' + __dirname, 'chat.html')
		);
		return chatWindow;
	};

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
			if (Cryptocat.Me.connected) {
				Cryptocat.Win.create.chat(
					this.props.username, true, function() {}
				);
			}
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
					className: 'mainRosterBuddyStatus'
				}),
				this.props.username
			]);
		}
	});

	var mainRoster = React.createClass({
		displayName: 'mainRoster',
		getInitialState: function() {
			return {
				buddies: {},
				isReconn: false,
				filter: ''
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentWillUnmount: function() {
			delete this.renderedBuddies;
			return true;
		},
		renderedBuddies: {},
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
				} else {
					Cryptocat.XMPP.getDeviceList(item.jid.local);
				}
				var buddy = React.createElement(mainRosterBuddy, {
					key: item.jid.local,
					username: item.jid.local,
					subscription: item.subscription,
					status: status,
					ref: function(b) {
						_t.renderedBuddies[item.jid.local] = b;
					}
				});
				newBuddies[item.jid.local] = buddy;
			});
			this.setState({buddies: newBuddies});
		},
		updateBuddyStatus: function(username, status, notify) {
			var newBuddies = this.state.buddies;
			var _t = this;
			if (
				hasProperty(newBuddies, username) &&
				hasProperty(newBuddies[username], 'props') &&
				hasProperty(newBuddies[username].props, 'status') &&
				(newBuddies[username].props.status === status)
			) {
				return false;
			}
			newBuddies[username] = React.createElement(mainRosterBuddy, {
				key: username,
				username: username,
				subscription: '',
				status: status,
				ref: function(b) {
					_t.renderedBuddies[username] = b;
				}
			}, null);
			this.setState({buddies: newBuddies});
			if (notify && (status === 2)) {
				Cryptocat.Notify.showNotification(
					username + ' is online.',
					'Click here to chat with them.',
					function() {
						Cryptocat.Win.create.chat(username, true, function() {});
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
			return this.state.buddies[username].props.status;
		},
		removeBuddy: function(username) {
			var _t = this;
			var newBuddies = this.state.buddies;
			if (!hasProperty(newBuddies, username)) {
				return false;
			}
			delete newBuddies[username];
			this.setState({buddies: newBuddies}, function() {
				delete _t.renderedBuddies[username];
				delete Cryptocat.Me.settings.userBundles[username];
			});
			if (hasProperty(Cryptocat.Win.chat, username)) {
				Cryptocat.Win.chat[username].webContents.send(
					'chat.status', 0
				);
			}
		},
		onChangeFilter: function(e) {
			var _t = this;
			var f = e.target.value.toLowerCase();
			_t.setState({filter: f}, function() {
				for (var b in _t.renderedBuddies) {
					if (hasProperty(_t.renderedBuddies, b)) {
						_t.renderedBuddies[b].setState({
							visible: (_t.renderedBuddies[b].props
								.username.indexOf(f) === 0)
						});
					}
				}
			});
		},
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
			for (var i = 0; i < 3; i += 1) {
				buddiesArrays[i].sort(function(a, b) {
					if (a.props.username < b.props.username) {
						return -1;
					}
					return +1;
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
				React.createElement('div', {
					key: 1,
					className: 'mainRosterIsReconn',
					'data-visible': this.state.isReconn
				}, 'Disconnected. Reconnecting...'),
				React.createElement('input', {
					key: 2,
					type: 'text',
					className: 'mainRosterFilter',
					placeholder: 'Filter...',
					value: this.state.filter,
					onChange: this.onChangeFilter
				}),
				React.createElement('div', {
					key: 3,
					className: 'mainRosterIntro',
					'data-visible': !buddiesArrays.length
				}, React.createElement('h2', {
					key: 4
				}, 'Welcome.'),
				React.createElement('p', {
					key: 5
				}, ''))
			].concat(buddiesArrays));
		}
	});

	var mainLogin = React.createClass({
		displayName: 'mainLogin',
		getInitialState: function() {
			return {
				username: '',
				password: '',
				disabled: false,
				display: 'block',
				reconn: 5000,
				isReconn: false,
				rememberIsChecked: false
			};
		},
		componentDidMount: function() {
			var _t = this;
			Cryptocat.Storage.getCommon(function(err, common) {
				var screenRes = Remote.screen.getPrimaryDisplay().size;
				if (
					common &&
					common.rememberedLogin.username.length &&
					common.rememberedLogin.password.length
				) {
					_t.setState({
						username: common.rememberedLogin.username,
						password: common.rememberedLogin.password,
						rememberIsChecked: true
					}, function() {
						_t.onSubmit();
					});
					document.getElementsByClassName(
						'mainLoginRememberCheckbox'
					)[0].checked = true;
				}
				if (
					common &&
					(screenRes.width > common.mainWindowBounds.x) &&
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
				} else {
					Remote.getCurrentWindow().show();
				}
			});
			if (Cryptocat.Win.chatRetainer.length === 0) {
				Cryptocat.Win.chatRetainer.push(spawnChatWindow());
			}
			return true;
		},
		componentDidUpdate: function() {
			var _t = this;
			if (Cryptocat.Win.main.roster) {
				Cryptocat.Win.main.roster.setState({
					isReconn: _t.state.isReconn
				});
			}
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
				Cryptocat.XMPP.connect(
					this.state.username, this.state.password,
					function(s) {
						if (s) {
							_t.onConnect();
						} else {
							_t.onDisconnect();
						}
					}
				);
			} else {
				Cryptocat.Diag.error.loginInvalid();
			}
			if (e) {
				e.preventDefault();
			}
			return false;
		},
		validInputs: function() {
			if (
				Cryptocat.Patterns.username.test(this.state.username) &&
				Cryptocat.Patterns.password.test(this.state.password)
			) {
				return true;
			}
			return false;
		},
		onConnect: function() {
			this.setState({
				display: 'none',
				isReconn: false,
				reconn: 5000
			});
			var rememberedLogin = {
				username: '',
				password: ''
			};
			if (this.state.rememberIsChecked) {
				rememberedLogin.username = this.state.username;
				rememberedLogin.password = this.state.password;
			}
			Cryptocat.Storage.updateCommon({
				rememberedLogin: rememberedLogin
			}, function() {});
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
			for (var username in Cryptocat.Win.chat) {
				if (hasProperty(Cryptocat.Win.chat, username)) {
					Cryptocat.Win.chat[username].webContents.send(
						'chat.connected', true
					);
				}
			}
		},
		onAuthFailed: function() {
			Cryptocat.Me = Object.assign({}, Cryptocat.EmptyMe);
			this.setState({
				disabled: false,
				display: 'block',
				isReconn: false,
				reconn: 5000
			});
			ReactDOM.unmountComponentAtNode(
				document.getElementById('renderB')
			);
			delete Cryptocat.Win.main.roster;
			Cryptocat.Diag.error.loginInvalid();
		},
		onDisconnect: function() {
			var _t = this;
			if (Cryptocat.Me.connected) {
				Cryptocat.Me.connected = false;
				_t.setState({
					isReconn: true
				});
				for (var username in Cryptocat.Win.chat) {
					if (hasProperty(Cryptocat.Win.chat, username)) {
						Cryptocat.Win.chat[username].webContents.send(
							'chat.connected', false
						);
					}
				}
			}
			console.info(
				'Cryptocat.Win:',
				'Reconnecting in ' + _t.state.reconn
			);
			setTimeout(function() {
				if (
					!Cryptocat.Me.connected &&
					_t.state.isReconn
				) {
					var incr = (function() {
						if (_t.state.reconn < 20000) {
							return 5000;
						}
						return 0;
					})();
					Cryptocat.XMPP.disconnect(false, function() {
						_t.onSubmit();
					});
					_t.setState({
						reconn: _t.state.reconn + incr,
						isReconn: true
					});
					return false;
				}
				_t.setState({
					reconn: 5000,
					isReconn: false
				});
			}, _t.state.reconn);
		},
		onLogOut: function() {
			Cryptocat.Me = Object.assign({}, Cryptocat.EmptyMe);
			this.setState({
				disabled: false,
				display: 'block',
				iReconn: false,
				reconn: 5000
			});
			for (var username in Cryptocat.Win.chat) {
				if (hasProperty(Cryptocat.Win.chat, username)) {
					Cryptocat.Win.chat[username].webContents.send(
						'chat.connected', false
					);
				}
			}
			if (!this.state.rememberIsChecked) {
				this.setState({
					password: ''
				});
			}
			ReactDOM.unmountComponentAtNode(
				document.getElementById('renderB')
			);
			delete Cryptocat.Win.main.roster;
		},
		onRememberCheckboxChange: function(e) {
			var bef = this.state.rememberIsChecked;
			var now = e.target.checked;
			this.setState({
				rememberIsChecked: now
			}, function() {
				if (!bef && now) {
					Cryptocat.Diag.message.rememberIsChecked();
				}
				if (bef && !now) {
					Cryptocat.Storage.updateCommon({
						rememberedLogin: {
							username: '',
							password: ''
						}
					}, function() {});
				}
			});
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
				React.createElement('label', {
					key: 3,
					checked: this.state.rememberIsChecked,
					disabled: this.state.disabled,
					className: 'mainLoginRemember'
				}, [
				React.createElement('input', {
					key: 4,
					type: 'checkbox',
					onChange: this.onRememberCheckboxChange,
					className: 'mainLoginRememberCheckbox'
				}),
				React.createElement('span', {
					key: 5,
					className: 'mainLoginRememberText'
				}, 'Remember me')]),
				React.createElement('input', {
					key: 6,
					type: 'submit',
					value: 'Login',
					disabled: this.state.disabled
				}),
				React.createElement('br', {
					key: 7
				}),
				React.createElement('input', {
					key: 8,
					className: 'create',
					type: 'button',
					value: 'Create Account',
					onClick: function() {
						Cryptocat.Pinning.get(
							`https://${Cryptocat.Hostname}/create`,
							function(res, valid) {
								if (valid) {
									Remote.shell.openExternal(
										`https://${Cryptocat.Hostname}/create`
									);
								} else {
									Cryptocat.Diag.error.createAccount();
								}
							}
						);
					}
				}),
				React.createElement('span', {
					key: 9,
					className: 'version'
				}, Cryptocat.Version)
			]);
		}
	});

	Cryptocat.Win.create.updateDownloader = function() {
		var updateDownloader = new Remote.BrowserWindow({
			width: 330,
			height: renderWindowHeight(120),
			title: 'Downloading Update...',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: true,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		updateDownloader.setMenu(null);
		updateDownloader.webContents.on('did-finish-load', function() {
			updateDownloader.show();
		});
		updateDownloader.loadURL(
			Path.join('file://' + __dirname, 'updateDownloader.html')
		);
	};

	Cryptocat.Win.create.chat = function(username, autoFocus, callback) {
		if (hasProperty(Cryptocat.Win.chat, username)) {
			Cryptocat.Win.chat[username].focus();
			return false;
		}
		if (Cryptocat.Win.chatRetainer.length === 0) {
			Cryptocat.Win.chatRetainer.push(spawnChatWindow());
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
			status: Cryptocat.Win.main.roster.getBuddyStatus(username),
			connected: Cryptocat.Me.connected,
			myDeviceName: Cryptocat.Me.settings.deviceName
		});
		Cryptocat.Win.chat[username].setTitle(username);
		if (autoFocus) {
			Cryptocat.Win.chat[username].show();
		} else {
			Cryptocat.Win.chat[username].showInactive();
		}
		if (Cryptocat.Win.chatRetainer.length === 0) {
			Cryptocat.Win.chatRetainer.push(spawnChatWindow());
		}
		callback();
	};

	Cryptocat.Win.create.addBuddy = function() {
		var addBuddyWindow = new Remote.BrowserWindow({
			width: 320,
			height: renderWindowHeight(160),
			title: 'Add Buddy',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: false,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		addBuddyWindow.setMenu(null);
		addBuddyWindow.webContents.on('did-finish-load', function() {
			addBuddyWindow.show();
		});
		addBuddyWindow.loadURL(
			Path.join('file://' + __dirname, 'addBuddy.html')
		);
	};

	Cryptocat.Win.create.changePassword = function() {
		var changePasswordWindow = new Remote.BrowserWindow({
			width: 320,
			height: renderWindowHeight(190),
			title: 'Change Password',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: false,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		changePasswordWindow.setMenu(null);
		changePasswordWindow.webContents.on('did-finish-load', function() {
			changePasswordWindow.show();
		});
		changePasswordWindow.loadURL(
			Path.join('file://' + __dirname, 'changePassword.html')
		);
	};

	Cryptocat.Win.create.addDevice = function() {
		var addDeviceWindow = new Remote.BrowserWindow({
			width: 400,
			height: renderWindowHeight(250),
			title: 'Add Device',
			resizable: false,
			minimizable: false,
			maximizable: false,
			fullscreenable: false,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: false,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		addDeviceWindow.setMenu(null);
		addDeviceWindow.webContents.on('did-finish-load', function() {
			addDeviceWindow.show();
		});
		addDeviceWindow.loadURL(
			Path.join('file://' + __dirname, 'addDevice.html')
		);
	};

	Cryptocat.Win.create.deviceManager = function(username) {
		if (hasProperty(Cryptocat.Win.deviceManager, username)) {
			Cryptocat.Win.deviceManager[username].focus();
			return false;
		}
		Cryptocat.Win.deviceManager[username] = new Remote.BrowserWindow({
			width: 470,
			height: renderWindowHeight(250),
			title: 'Manage Devices',
			resizable: false,
			minimizable: true,
			maximizable: false,
			fullscreenable: false,
			show: false,
			autoHideMenuBar: true,
			webPreferences: {
				nodeIntegration: false,
				preload: Path.join(
					Path.resolve(__dirname, '..'),
					'js/global.js'
				)
			}
		});
		Cryptocat.Win.deviceManager[
			username
		].webContents.on('did-finish-load', function() {
			Cryptocat.Win.updateDeviceManager(username);
			Cryptocat.XMPP.getDeviceList(username);
			Cryptocat.Win.deviceManager[username].show();
		});
		Cryptocat.Win.deviceManager[username].on('closed', function() {
			delete Cryptocat.Win.deviceManager[username];
		});
		Cryptocat.Win.deviceManager[username].setMenu(null);
		Cryptocat.Win.deviceManager[username].loadURL(
			Path.join('file://' + __dirname, 'deviceManager.html')
		);
	};

	Cryptocat.Win.updateDeviceManager = function(username) {
		if (!hasProperty(Cryptocat.Win.deviceManager, username)) {
			return false;
		}
		var devices = [];
		var userBundles = Cryptocat.Me.settings.userBundles[username];
		for (var deviceId in userBundles) {
			if (hasProperty(userBundles, deviceId)) {
				var trusted = false;
				if (
					hasProperty(userBundles[deviceId], 'trusted') &&
					userBundles[deviceId].trusted
				) {
					trusted = true;
				}
				devices.push({
					deviceId: deviceId,
					deviceName: userBundles[deviceId].deviceName,
					deviceIcon: userBundles[deviceId].deviceIcon,
					deviceFingerprint: Cryptocat.OMEMO.deviceFingerprint(
						username, deviceId,
						userBundles[deviceId].deviceName,
						userBundles[deviceId].deviceIcon,
						userBundles[deviceId].identityKey
					),
					trusted: trusted
				});
			}
		}
		Cryptocat.Win.deviceManager[username].webContents.send(
			'deviceManager.update', {
				username: username,
				devices: devices,
				mine: (username === Cryptocat.Me.username),
				trustedOnly: (
					Cryptocat.Me.settings.trustedOnly.indexOf(username) >= 0
				)
			}
		);
	};

	Cryptocat.Win.main.login = ReactDOM.render(
		React.createElement(mainLogin, null),
		document.getElementById('renderA')
	);

	Cryptocat.Win.main.beforeQuit = function() {
		var position = Remote.getCurrentWindow().getPosition();
		var size = Remote.getCurrentWindow().getSize();
		Cryptocat.Storage.updateCommon({
			mainWindowBounds: {
				x: position[0],
				y: position[1],
				width: size[0],
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
				Cryptocat.XMPP.disconnect(false, function() {
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
			} else {
				IPCRenderer.sendSync('app.quit');
			}
		});
	};

	IPCRenderer.on('aboutBox.create', function(e) {
		Cryptocat.Diag.message.about();
	});

	IPCRenderer.on('addDevice.addDevice', function(e, name, icon) {
		Cryptocat.OMEMO.onAddDevice(name, icon);
	});

	IPCRenderer.on('addBuddy.create', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Win.create.addBuddy();
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('addBuddy.sendRequest', function(e, username) {
		if (Cryptocat.Me.connected) {
			if (username === Cryptocat.Me.username) {
				Cryptocat.Diag.error.addBuddySelf();
			} else if (Cryptocat.OMEMO.jidHasUsername(username).valid) {
				Cryptocat.Diag.error.addBuddyAdded();
			} else {
				Cryptocat.XMPP.sendBuddyRequest(username);
				Cryptocat.Diag.message.addBuddySuccess();
			}
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('changePassword.changePassword', function(e, password) {
		if (Cryptocat.Me.connected) {
			Cryptocat.XMPP.changePassword(Cryptocat.Me.username, password);
			if (Cryptocat.Win.main.login.state.rememberIsChecked) {
				Cryptocat.Storage.updateCommon({
					rememberedLogin: {
						username: '',
						password: ''
					}
				}, function() {});
			}
			Cryptocat.Diag.message.changePasswordSuccess();
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('changePassword.create', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Win.create.changePassword();
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('chat.myChatState', function(e, to, chatState) {
		if (Cryptocat.Me.settings.typing) {
			Cryptocat.XMPP.sendChatState(to, chatState);
		}
	});

	IPCRenderer.on('chat.openDialog', function(e, to) {
		Cryptocat.Directories.openDialog(
			Cryptocat.Win.chat[to],
			Cryptocat.Me.settings.directories.fileSelect,
			function(paths) {
				if (!paths || !paths.length) { return false; }
				Cryptocat.Me.settings.directories.fileSelect =
					Path.dirname(paths[0]) + Path.sep;
				Cryptocat.Win.chat[to].webContents.send(
					'chat.openDialog', paths
				);
			}
		);
	});

	IPCRenderer.on('chat.saveDialog', function(e, to, name, url) {
		Cryptocat.Directories.saveDialog(
			Cryptocat.Win.chat[to],
			Cryptocat.Me.settings.directories.fileSave,
			name, function(path) {
				if (!path) { return false; }
				Cryptocat.Me.settings.directories.fileSave =
					Path.dirname(path) + Path.sep;
				Cryptocat.Win.chat[to].webContents.send(
					'chat.saveDialog', path, url
				);
			}
		);
	});

	IPCRenderer.on('chat.sendMessage', function(e, to, message) {
		Cryptocat.OMEMO.sendMessage(to, message);
	});

	IPCRenderer.on('deviceManager.create', function(e, username) {
		if (Cryptocat.Me.connected) {
			if (!username || !username.length) {
				username = Cryptocat.Me.username;
			}
			Cryptocat.Win.create.deviceManager(username);
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('deviceManager.removeDevice', function(e, deviceId) {
		Cryptocat.OMEMO.removeDevice(deviceId);
	});

	IPCRenderer.on('deviceManager.setTrusted', function(
		e, username, deviceId, trusted
	) {
		Cryptocat.Me.settings.userBundles[username][deviceId].trusted = trusted;
	});

	IPCRenderer.on('deviceManager.setTrustedOnly', function(e, username, trusted) {
		var trustedOnly = Cryptocat.Me.settings.trustedOnly;
		var indexOf = trustedOnly.indexOf(username);
		if (trusted) {
			if (indexOf < 0) {
				trustedOnly.push(username);
			}
		} else {
			if (indexOf >= 0) {
				trustedOnly.splice(indexOf, 1);
			}
		}
	});

	IPCRenderer.on('main.beforeQuit', function(e) {
		Cryptocat.Win.main.beforeQuit();
	});

	IPCRenderer.on('main.checkForUpdates', function(e) {
		Cryptocat.Update.check(true, function() {
			Cryptocat.Diag.message.isLatest(
				Cryptocat.Version
			);
		});
	});

	IPCRenderer.on('main.deleteAccount', function(e) {
		if (!Cryptocat.Me.connected) {
			Cryptocat.Diag.error.offline();
			return false;
		}
		Cryptocat.Diag.message.deleteAccount(
			Cryptocat.Me.username, function(response) {
				if (response === 1) {
					Remote.shell.openExternal(
						`https://${Cryptocat.Hostname}/help.html#deleteAccount`
					);
				}
				if (response === 2) {
					if (Cryptocat.Win.main.login.state.rememberIsChecked) {
						Cryptocat.Storage.updateCommon({
							rememberedLogin: {
								username: '',
								password: ''
							}
						}, function() {});
					}
					Cryptocat.XMPP.deleteAccount(
						Cryptocat.Me.username
					);
				}
			}
		);
	});

	IPCRenderer.on('main.logOut', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.XMPP.disconnect(false, function() {
				Cryptocat.Win.main.login.onLogOut();
			});
		} else {
			Cryptocat.Diag.error.offline();
		}
	});

	IPCRenderer.on('main.onSuspend', function(e) {
		if (Cryptocat.Me.connected) {
			Cryptocat.XMPP.disconnect(true);
		}
	});

	IPCRenderer.on('main.updateNotifySetting', function(e, notify) {
		if (Cryptocat.Me.connected) {
			Cryptocat.Me.settings.notify = notify;
			IPCRenderer.send('app.updateMenuSettings', {
				notify: Cryptocat.Me.settings.notify,
				sounds: Cryptocat.Me.settings.sounds,
				typing: Cryptocat.Me.settings.typing
			});
		} else {
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
		} else {
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
		} else {
			Cryptocat.Diag.error.offline();
		}
	});
});

