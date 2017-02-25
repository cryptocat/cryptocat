'use strict';
const Electron = require('electron');
const FS = require('fs');
const Path = require('path');

const Windows = {
	main: null,
	last: null
};
const MenuSettings = {
	notify: false,
	sounds: false,
	typing: false
};

let IntentToQuit = false;
let TrayIcon = {};
let TrayIconFirstMinimized = true;

const handleStartupEvent = {
	win32: function() {
		const childProc = require('child_process');
		const AppDataDir = Path.join(process.env.LOCALAPPDATA, 'Cryptocat');
		if (process.argv[1] === '--squirrel-install') {
			childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
				cwd: AppDataDir,
				timeout: 10000
			});
			Electron.app.quit();
		}
		if (process.argv[1] === '--squirrel-updated') {
			childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
				cwd: AppDataDir,
				timeout: 10000
			});
			Electron.app.quit();
		}
		if (process.argv[1] === '--squirrel-obsolete') {
			Electron.app.quit();
		}
		if (process.argv[1] === '--squirrel-uninstall') {
			Electron.app.quit();
		}
	},
	linux: function() {
		return false;
	},
	darwin: function() {
		return false;
	}
}; handleStartupEvent[process.platform]();

const buildTrayMenu = function(settings) {
	let menu = Electron.Menu.buildFromTemplate([
		{
			label: 'Buddy List',
			click: function() {
				Windows.main.show();
				Windows.main.focus();
			}
		}, {
			type: 'separator'
		}, {
			label: 'Add Buddy',
			click: function() {
				Windows.main.webContents.send(
					'addBuddy.create'
				);
			}
		}, {
			label: 'Manage Devices',
			click: function() {
				Windows.main.webContents.send(
					'deviceManager.create'
				);
			}
		}, {
			type: 'separator'
		}, {
			label: 'Settings',
			submenu: [{
				label: 'Notifications',
				type: 'checkbox',
				checked: settings.notify,
				click: function(e) {
					Windows.main.webContents.send(
						'main.updateNotifySetting',
						e.checked
					);
				}
			}, {
				label: 'Sounds',
				type: 'checkbox',
				checked: settings.sounds,
				click: function(e) {
					Windows.main.webContents.send(
						'main.updateSoundsSetting',
						e.checked
					);
				}
			}, {
				label: 'Send Typing Indicator',
				type: 'checkbox',
				checked: settings.typing,
				click: function(e) {
					Windows.main.webContents.send(
						'main.updateTypingSetting',
						e.checked
					);
				}
			}, {
				type: 'separator'
			}, {
				label: 'Set Avatar',
				click: function() {
					Windows.main.webContents.send(
						'setAvatar.create'
					);
				}
			}, {
				type: 'separator'
			}, {
				label: 'Delete Account',
				click: function(e) {
					Windows.main.webContents.send('main.deleteAccount');
				}
			}]
		}, {
			label: 'Log Out',
			click: function(e) {
				Windows.main.webContents.send('main.logOut');
			}
		}, {
			type: 'separator'
		}, {
			label: 'Help',
			click: function() {
				Electron.shell.openExternal('https://crypto.cat/help.html');
			}
		}, {
			role: 'quit',
			visible: process.platform !== 'darwin'
		}
	]);
	return menu;
};

const buildMainMenu = function(settings) {
	let menu = Electron.Menu.buildFromTemplate([
		{
			label: 'Account',
			id: '0',
			enabled: true,
			submenu: [{
				label: 'Add Buddy',
				accelerator: 'Alt+A',
				click: function() {
					Windows.main.webContents.send('addBuddy.create');
				}
			}, {
				label: 'Manage Devices',
				accelerator: 'Alt+D',
				click: function() {
					Windows.main.webContents.send('deviceManager.create');
				}
			}, {
				label: 'Change Password',
				click: function() {
					Windows.main.webContents.send('changePassword.create');
				}
			}, {
				type: 'separator'
			}, {
				label: 'Settings',
				submenu: [{
					label: 'Notifications',
					type: 'checkbox',
					checked: settings.notify,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateNotifySetting',
							e.checked
						);
					}
				}, {
					label: 'Sounds',
					type: 'checkbox',
					checked: settings.sounds,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateSoundsSetting',
							e.checked
						);
					}
				}, {
					label: 'Send Typing Indicator',
					type: 'checkbox',
					checked: settings.typing,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateTypingSetting',
							e.checked
						);
					}
				}, {
					type: 'separator'
				}, {
					label: 'Set Avatar',
					click: function() {
						Windows.main.webContents.send(
							'setAvatar.create'
						);
					}
				}, {
					type: 'separator'
				}, {
					label: 'Delete Account',
					click: function(e) {
						Windows.main.webContents.send('main.deleteAccount');
					}
				}]
			}, {
				label: 'Log Out',
				click: function(e) {
					Windows.main.webContents.send('main.logOut');
				}
			}, {
				type: 'separator'
			}, {
				role: 'services',
				visible: process.platform === 'darwin',
				submenu: []
			}, {
				type: 'separator'
			}, {
				role: 'hide'
			}, {
				role: 'hideothers'
			}, {
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				role: 'quit'
			}
			]}, {
				label: 'Edit',
				id: '2',
				enabled: true,
				submenu: [{
					role: 'undo'
				}, {
					role: 'redo'
				}, {
					type: 'separator'
				}, {
					role: 'cut'
				}, {
					role: 'copy'
				}, {
					role: 'paste'
				}, {
					role: 'selectall'
				}]
			}, {
				role: 'window',
				id: '3',
				submenu: [{
					role: 'close'
				}, {
					role: 'minimize'
				}, {
					type: 'separator'
				}, {
					role: 'front'
				}]
			}, {
				role: 'help',
				id: '4',
				enabled: true,
				submenu: [{
					label: 'Getting Started',
					click: function() {
						Electron.shell.openExternal(
							'https://crypto.cat/help.html'
						);
					}
				}, {
					label: 'Report a Bug',
					click: function() {
						Electron.shell.openExternal(
							'https://github.com/cryptocat/cryptocat/issues/'
						);
					}
				}, {
					label: 'Check for Updates',
					click: function() {
						Windows.main.webContents.send('main.checkForUpdates');
					}
				}, {
					type: 'separator'
				}, {
					label: 'Get Stickers',
					click: function() {
						Electron.shell.openExternal(
							'https://crypto.cat/stickers'
						);
					}
				}, {
					label: 'About Cryptocat',
					click: function() {
						Windows.main.webContents.send('aboutBox.create');
					}
				}]
			}
		]
	);
	if (0) {
		menu.append(new Electron.MenuItem({
			label: 'Developer',
			submenu: [{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: function(item, focusedWindow) {
					if (focusedWindow) {
						focusedWindow.reload();
					}
				}
			},
			{
				label: 'Developer Tools',
				accelerator: 'Shift+CmdOrCtrl+I',
				click: function(item, focusedWindow) {
					if (focusedWindow) {
						focusedWindow.toggleDevTools();
					}
				}
			}]
		}));
	}
	return menu;
};

const buildMacMenu = function(settings) {
	let isChatWindow = (/chat\.html$/).test(Windows.last.getURL());
	let chat = Electron.Menu.buildFromTemplate([{
		label: 'Chat',
		id: '1',
		submenu: [{
			label: 'View Devices',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.viewDevices');
			}
		}, {
			label: 'Send File',
			accelerator: 'alt+F',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.sendFile');
			}
		}, {
			label: 'Record Audio/Video',
			accelerator: 'alt+R',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.record');
			}
		}]
	}]);
	let view = Electron.Menu.buildFromTemplate([{
		label: 'View',
		submenu: [{
			label: 'Increase Font Size',
			accelerator: 'CmdOrCtrl+Plus',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.increaseFontSize');
			}
		}, {
			label: 'Decrease Font Size',
			accelerator: 'CmdOrCtrl+-',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.decreaseFontSize');
			}
		}, {
			label: 'Reset Font Size',
			accelerator: 'CmdOrCtrl+0',
			click: function(item, focusedWindow) {
				focusedWindow.webContents.send('chat.resetFontSize');
			}
		}]
	}]);
	let menu = buildMainMenu(settings);
	if (isChatWindow) {
		menu.insert(1, chat.items[0]);
		menu.insert(3, view.items[0]);
	}
	return menu;
};

Electron.app.on('ready', function() {
	if (process.platform !== 'darwin') {
		TrayIcon = new Electron.Tray(
			Path.join(__dirname, 'img/logo/128x128.png')
		);
	}
	Windows.main = new Electron.BrowserWindow({
		icon: Path.join(__dirname, 'img/logo/64x64.png'),
		minWidth: 270,
		width: 270,
		maxWidth: 400,
		height: 470,
		minHeight: 440,
		maximizable: false,
		fullscreenable: false,
		show: false,
		title: 'Cryptocat',
		webPreferences: {
			preload: Path.join(__dirname, 'js/global.js')
		}
	});
	Windows.last = Windows.main;
	Windows.main.on('close', function(e) {
		if (!IntentToQuit) {
			e.preventDefault();
			Windows.main.hide();
			if (process.platform !== 'darwin') {
				if (TrayIconFirstMinimized) {
					TrayIconFirstMinimized = false;
					TrayIcon.displayBalloon({
						icon: Path.join(__dirname, 'img/logo/64x64.png'),
						title: 'Cryptocat is still running',
						content: 'It awaits you snugly in your desktop tray.'
					});
				}
			}
		}
	});
	Windows.main.loadURL('file://' + __dirname + '/win/main.html');
	if (process.platform === 'darwin') {
		Electron.app.dock.setMenu(buildTrayMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
		Electron.Menu.setApplicationMenu(buildMacMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
	} else {
		TrayIcon.setToolTip('Cryptocat');
		TrayIcon.setContextMenu(buildTrayMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
		TrayIcon.on('click', function() {
			Windows.main.show();
		});
		Windows.main.setMenu(buildMainMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
	}
	Electron.powerMonitor.on('suspend', () => {
		Windows.main.webContents.send('main.onSuspend');
	});
});

Electron.app.on('activate', function(e) {
	Windows.last.show();
});

Electron.app.on('before-quit', function(e) {
	if (!IntentToQuit) {
		e.preventDefault();
	}
	Windows.main.webContents.send('main.beforeQuit');
});

Electron.app.on('browser-window-focus', function(e, w) {
	Windows.last = w;
	if (process.platform === 'darwin') {
		Electron.Menu.setApplicationMenu(buildMacMenu(MenuSettings));
	}
});

Electron.ipcMain.on('addBuddy.sendRequest', function(e, username) {
	Windows.main.webContents.send('addBuddy.sendRequest', username);
	e.returnValue = 'true';
});

Electron.ipcMain.on('addDevice.addDevice', function(e, name, icon) {
	Windows.main.webContents.send('addDevice.addDevice', name, icon);
	e.returnValue = 'true';
});

Electron.ipcMain.on('app.updateMenuSettings', function(e, settings) {
	MenuSettings.notify = settings.notify;
	MenuSettings.sounds = settings.sounds;
	MenuSettings.typing = settings.typing;
	if (process.platform === 'darwin') {
		Electron.Menu.setApplicationMenu(buildMacMenu(settings));
		Electron.app.dock.setMenu(buildTrayMenu(settings));
	} else {
		Windows.main.setMenu(buildMainMenu(settings));
		TrayIcon.setContextMenu(buildTrayMenu(settings));
	}
});

Electron.ipcMain.on('app.quit', function(e) {
	IntentToQuit = true;
	Windows.main.destroy();
	Electron.app.quit();
	e.returnValue = 'true';
});

Electron.ipcMain.on('chat.openDialog', function(e, to) {
	Windows.main.webContents.send('chat.openDialog', to);
});

Electron.ipcMain.on('chat.myChatState', function(e, to, chatState) {
	Windows.main.webContents.send('chat.myChatState', to, chatState);
});

Electron.ipcMain.on('chat.saveDialog', function(e, to, name, url) {
	Windows.main.webContents.send('chat.saveDialog', to, name, url);
});

Electron.ipcMain.on('chat.sendMessage', function(e, to, message) {
	Windows.main.webContents.send('chat.sendMessage', to, message);
	e.returnValue = 'true';
});

Electron.ipcMain.on('changePassword.changePassword', function(e, password) {
	Windows.main.webContents.send('changePassword.changePassword', password);
	e.returnValue = 'true';
});

Electron.ipcMain.on('deviceManager.create', function(e, username) {
	Windows.main.webContents.send('deviceManager.create', username);
});

Electron.ipcMain.on('deviceManager.removeDevice', function(e, deviceId) {
	Windows.main.webContents.send('deviceManager.removeDevice', deviceId);
	e.returnValue = 'true';
});

Electron.ipcMain.on('deviceManager.setTrusted', function(
	e, username, deviceId, trusted
) {
	Windows.main.webContents.send(
		'deviceManager.setTrusted', username, deviceId, trusted
	);
	e.returnValue = 'true';
});

Electron.ipcMain.on('deviceManager.setTrustedOnly', function(
	e, username, trusted
) {
	Windows.main.webContents.send(
		'deviceManager.setTrustedOnly', username, trusted
	);
	e.returnValue = 'true';
});

Electron.ipcMain.on('main.beforeQuit', function(e) {
	Windows.main.webContents.send('main.beforeQuit');
	e.returnValue = 'true';
});

Electron.ipcMain.on('main.checkForUpdates', function(e, to, message) {
	Windows.main.webContents.send('main.checkForUpdates');
});

Electron.ipcMain.on('setAvatar.setAvatar', function(e, avatar) {
	Windows.main.webContents.send('setAvatar.setAvatar', avatar);
	e.returnValue = 'true';
});

process.on('uncaughtException', function(err) {
	return false;
});
