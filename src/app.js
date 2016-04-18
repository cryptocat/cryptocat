const Electron      = require('electron');
const BrowserWindow = require('browser-window');
const FS            = require('fs');
var Windows  = { main: null, last: null };
var TrayIcon = {};
var IntentToQuit = false;

var handleStartupEvent = function() {
	if (process.platform === 'linux') {
		var shortcut = '[Desktop Entry]\n';
		var path     = process.env.HOME + '/.local';
		var exePath  = Electron.app.getPath('exe');
		var icoPath  = exePath.slice(0, -9) + 'logo.png';
		shortcut    += 'Name=Cryptocat\n';
		shortcut    += 'Exec=' + exePath + '\n';
		shortcut    += 'Icon=' + icoPath + '\n';
		shortcut    += 'Terminal=false\n';
		shortcut    += 'Type=Application\n';
		shortcut    += 'Categories=GNOME;GTK;Network;InstantMessaging;\n';
		shortcut    += 'Comment=Easy, secure chat for your computer.'
		FS.stat(path, function(err, stats) {
			if (!stats.isDirectory()) {
				FS.mkdirSync(path, '0o700');
			}
			path += '/share';
			FS.stat(path, function(err, stats) {
				if (!stats.isDirectory()) {
					FS.mkdirSync(path, '0o700');
				}
				path += '/applications';
				FS.stat(path, function(err, stats) {
					if (!stats.isDirectory()) {
						FS.mkdirSync(path, '0o700');
					}
					path += '/Cryptocat.desktop';
					FS.writeFile(path, shortcut, function(err) {
					});
				});
			});
		});
		return false;
	}
	else if (process.platform === 'darwin') {
		return false;
	}
	const childProc = require('child_process');
	const AppDataDir = process.env.LOCALAPPDATA + '\\Cryptocat'
	if (process.argv[1] === '--squirrel-install') {
		childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
			cwd: AppDataDir, timeout: 10000
		});
		Electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-updated') {
		childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
			cwd: AppDataDir, timeout: 10000
		});
		Electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-obsolete') {
		Electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-uninstall') {
		Electron.app.quit();
	}
}; if (handleStartupEvent()) { return false };

var buildTrayMenu = function(settings) {
	var menu = Electron.Menu.buildFromTemplate([
		{
			label: 'Buddy List',
			click: function() {
				Windows.main.show();
				Windows.main.focus();
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Add Buddy',
			click: function() {
				Windows.main.webContents.send(
					'addBuddy.create'
				);
			}
		},
		{
			label: 'Manage Devices',
			click: function() {
				Windows.main.webContents.send(
					'deviceManager.create'
				);
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Settings',
			submenu: [
				{
					label: 'Notifications',
					type: 'checkbox',
					checked: settings.notify,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateNotifySetting',
							e.checked
						);
					}
				},
				{
					label: 'Sounds',
					type: 'checkbox',
					checked: settings.sounds,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateSoundsSetting',
							e.checked
						);
					}
				},
				{
					label: 'Send Typing Indicator',
					type: 'checkbox',
					checked: settings.typing,
					click: function(e) {
						Windows.main.webContents.send(
							'main.updateTypingSetting',
							e.checked
						);
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Delete Account',
					click: function(e) {
						Windows.main.webContents.send('main.deleteAccount');
					}
				}
			]
		},
		{
			label: 'Log Out',
			click: function(e) {
				Windows.main.webContents.send('main.logOut');
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Help',
			click: function() {
				Electron.shell.openExternal('https://crypto.cat/help.html');
			}
		}
	]);
	if (process.platform !== 'darwin') {
		menu.append(new Electron.MenuItem({
			label: 'Quit',
			role: 'quit',
			click: function() {
				Windows.main.webContents.send('main.beforeQuit');
			}
		}));
	}
	return menu;
};

var buildMainMenu = function(settings) {
	var menu = Electron.Menu.buildFromTemplate([
		{
			label: 'Account',
			submenu: [
				{
					label: 'Add Buddy',
					accelerator: 'Alt+A',
					click: function() {
						Windows.main.webContents.send('addBuddy.create');
					}
				},
				{
					label: 'Manage Devices',
					accelerator: 'Alt+D',
					click: function() {
						Windows.main.webContents.send('deviceManager.create');
					}
				},
				{
					label: 'Change Password',
					click: function() {
						Windows.main.webContents.send('changePassword.create');
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Settings',
					submenu: [
						{
							label: 'Notifications',
							type: 'checkbox',
							checked: settings.notify,
							click: function(e) {
								Windows.main.webContents.send(
									'main.updateNotifySetting',
									e.checked
								);
							}
						},
						{
							label: 'Sounds',
							type: 'checkbox',
							checked: settings.sounds,
							click: function(e) {
									Windows.main.webContents.send(
									'main.updateSoundsSetting',
									e.checked
								);
							}
						},
						{
							label: 'Send Typing Indicator',
							type: 'checkbox',
							checked: settings.typing,
							click: function(e) {
								Windows.main.webContents.send(
									'main.updateTypingSetting',
									e.checked
								);
							}
						},
						{
							type: 'separator'
						},
						{
							label: 'Delete Account',
							click: function(e) {
								Windows.main.webContents.send('main.deleteAccount');
							}
						}
					]
				},
				{
					label: 'Log Out',
					click: function(e) {
						Windows.main.webContents.send('main.logOut');
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Close',
					accelerator: 'CmdOrCtrl+W',
					click: function(item, focusedWindow) {
						if (focusedWindow) { focusedWindow.close(); }
					}
				},
				{
					label: 'Quit',
					accelerator: 'CmdOrCtrl+Q',
					click: function() {
						Windows.main.webContents.send('main.beforeQuit');
					}
				}
			]
		},
		{
			label: 'Help',
			role: 'help',
			submenu: [{
				label: 'Getting Started',
				click: function() {
					Electron.shell.openExternal(
						'https://crypto.cat/help.html'
					)
				}
			},
			{
				label: 'Report a Bug',
				click: function() {
					Electron.shell.openExternal(
						'https://github.com/cryptocat/cryptocat/issues/'
					)
				}
			},
			{
				label: 'Check for Updates',
				click: function() {
					Windows.main.webContents.send('main.checkForUpdates');
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'About Cryptocat',
				click: function() {
					Windows.main.webContents.send('aboutBox.create');
				}
			}]
		}
	]);
	if (false) {
		menu.append(new Electron.MenuItem({
			label: 'Developer',
			submenu: [{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: function(item, focusedWindow) {
					if (focusedWindow) focusedWindow.reload();
				}
			},
			{
				label: 'Developer Tools',
				accelerator: 'Shift+CmdOrCtrl+I',
				click: function(item, focusedWindow) {
					if (focusedWindow) focusedWindow.toggleDevTools();
				}
			}]
		}));
	}
	return menu;
};
	
Electron.app.on('ready', function() {
	if (process.platform !== 'darwin') {
		TrayIcon = new Electron.Tray(
			__dirname + '/img/logo/logo.png'
		);
	}
	Windows.main = new BrowserWindow({
		minWidth: 260,
		width: 260,
		maxWidth: 400,
		height: 470,
		minHeight: 400,
		maximizable: false,
		fullscreenable: false,
		show: false,
		title: 'Cryptocat'
	});
	Windows.main.on('close', function(e) {
		if (!IntentToQuit) {
			e.preventDefault();
			Windows.main.hide();
			if (process.platform !== 'darwin') {
				TrayIcon.displayBalloon({
					icon: __dirname + '/img/logo/logo.png',
					title: 'Cryptocat is still running',
					content: 'Click here to resume using Cryptocat.'
				});
			}
		}
	});
	Windows.main.loadURL('file://' + __dirname + '/win/main.html');
	if (process.platform === 'darwin') {
		Electron.app.dock.setMenu(buildTrayMenu({
			notify: false,
			sounds: false,
			typing: false,
		}));
		Electron.Menu.setApplicationMenu(buildMainMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
	}
	else {
		TrayIcon.setToolTip('Cryptocat');
		TrayIcon.setContextMenu(buildTrayMenu({
			notify: false,
			sounds: false,
			typing: false
		}));
		TrayIcon.on('click', function() {
			Windows.main.show();
		});
	}
	Windows.main.setMenu(buildMainMenu({
		notify: false,
		sounds: false,
		typing: false
	}));
});

Electron.ipcMain.on('main.checkForUpdates', function(e, to, message) {
	Windows.main.webContents.send('main.checkForUpdates');
});

Electron.ipcMain.on('chat.sendMessage', function(e, to, message) {
	Windows.main.webContents.send('chat.sendMessage', to, message);
	e.returnValue = 'true';
});

Electron.ipcMain.on('chat.myChatState', function(e, to, chatState) {
	Windows.main.webContents.send('chat.myChatState', to, chatState);
	e.returnValue = 'true';
});

Electron.ipcMain.on('addBuddy.sendRequest', function(e, username) {
	Windows.main.webContents.send('addBuddy.sendRequest', username);
	e.returnValue = 'true';
});

Electron.ipcMain.on('changePassword.changePassword', function(e, password) {
	Windows.main.webContents.send('changePassword.changePassword', password);
	e.returnValue = 'true';
});

Electron.ipcMain.on('addDevice.addDevice', function(e, name, icon) {
	Windows.main.webContents.send('addDevice.addDevice', name, icon);
	e.returnValue = 'true';
});

Electron.ipcMain.on('deviceManager.create', function(e, username) {
	Windows.main.webContents.send('deviceManager.create', username);
	e.returnValue = 'true';
});

Electron.ipcMain.on('deviceManager.removeDevice', function(e, deviceId) {
	Windows.main.webContents.send('deviceManager.removeDevice', deviceId);
	e.returnValue = 'true';
});

Electron.ipcMain.on('main.beforeQuit', function(e) {
	Windows.main.webContents.send('main.beforeQuit');
	e.returnValue = 'true';
});

Electron.ipcMain.on('app.updateTraySettings', function(e, settings) {
	if (process.platform === 'darwin') {
		Electron.Menu.setApplicationMenu(buildMainMenu(settings));
		Electron.app.dock.setMenu(buildTrayMenu(settings));
	}
	else {
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

Electron.app.on('browser-window-created', function(e, w) {
	Windows.last = w;
});

Electron.app.on('browser-window-focus', function(e, w) {
	Windows.last = w;
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

process.on('uncaughtException', function(err) {
	return false;
});
