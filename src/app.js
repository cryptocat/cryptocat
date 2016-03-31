const electron = require('electron');
const BrowserWindow = require('browser-window');
var Windows  = { main: null, last: null };
var TrayIcon = {};

var HandleStartupEvent = function() {
	if (process.platform !== 'win32') {
		return false;
	}
	const childProc = require('child_process');
	const AppDataDir = process.env.LOCALAPPDATA + '\\Cryptocat'
	if (process.argv[1] === '--squirrel-install') {
		childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
			cwd: AppDataDir, timeout: 10000
		});
		electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-updated') {
		childProc.execSync('Update.exe --createShortcut=Cryptocat.exe', {
			cwd: AppDataDir, timeout: 10000
		});
		electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-obsolete') {
		electron.app.quit();
	}
	if (process.argv[1] === '--squirrel-uninstall') {
		electron.app.quit();
	}
}; if (HandleStartupEvent()) { return false };

var buildTrayMenu = function(settings) {
	return electron.Menu.buildFromTemplate([
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
			type: 'separator'
		},
		{
			label: 'Help',
			click: function() {
				electron.shell.openExternal('https://crypto.cat/help.html');
			}
		},
		{
			label: 'Quit',
			role: 'quit',
			click: function() {
				Windows.main.webContents.send('main.beforeQuit');
			}
		}
	]);
};

var MainMenu = electron.Menu.buildFromTemplate([
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
				electron.shell.openExternal(
					'https://crypto.cat/help.html'
				)
			}
		},
		{
			label: 'Report a Bug',
			click: function() {
				electron.shell.openExternal(
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
	MainMenu.append(new electron.MenuItem({
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

electron.app.on('ready', function() {
	if (process.platform !== 'darwin') {
		TrayIcon = new electron.Tray(
			__dirname + '/img/logo/logo.png'
		);
	}
	Windows.main = new BrowserWindow({
		minWidth: 260,
		width: 260,
		maxWidth: 400,
		height: 470,
		minHeight: 260,
		maximizable: false,
		fullscreenable: false,
		title: 'Cryptocat'
	});
	Windows.main.loadURL('file://' + __dirname + '/win/main.html');
	Windows.main.on('close', function(e) {
		e.preventDefault();
		Windows.main.hide();
		if (process.platform === 'darwin') {
			return false;
		}
		TrayIcon.displayBalloon({
			icon: __dirname + '/img/logo/logo.png',
			title: 'Cryptocat is still running',
			content: 'Click here to resume using Cryptocat.'
		});
	});
	if (process.platform === 'darwin') {
		electron.app.dock.setMenu(buildTrayMenu({
			notify: true,
			sounds: true
		}));
	}
	else {
		TrayIcon.setToolTip('Cryptocat');
		TrayIcon.setContextMenu(buildTrayMenu({
			notify: true,
			sounds: true
		}));
		TrayIcon.on('click', function() {
			Windows.main.show();
		});
	}
	Windows.main.setMenu(MainMenu);
	if (process.platform === 'darwin') {
		electron.Menu.setApplicationMenu(MainMenu);
	}
});


electron.ipcMain.on('chat.sendMessage', function(e, to, message) {
	Windows.main.webContents.send('chat.sendMessage', to, message);
	e.returnValue = 'true';
});

electron.ipcMain.on('addBuddy.sendRequest', function(e, username) {
	Windows.main.webContents.send('addBuddy.sendRequest', username);
	e.returnValue = 'true';
});

electron.ipcMain.on('changePassword.changePassword', function(e, password) {
	Windows.main.webContents.send('changePassword.changePassword', password);
	e.returnValue = 'true';
});

electron.ipcMain.on('addDevice.addDevice', function(e, name, icon) {
	Windows.main.webContents.send('addDevice.addDevice', name, icon);
	e.returnValue = 'true';
});

electron.ipcMain.on('deviceManager.removeDevice', function(e, deviceId) {
	Windows.main.webContents.send('deviceManager.removeDevice', deviceId);
	e.returnValue = 'true';
});

electron.ipcMain.on('main.beforeQuit', function(e) {
	Windows.main.webContents.send('main.beforeQuit');
	e.returnValue = 'true';
});

electron.ipcMain.on('app.updateTraySettings', function(e, settings) {
	if (process.platform === 'darwin') {
		electron.app.dock.setMenu(buildTrayMenu(settings));
	}
	else {
		TrayIcon.setContextMenu(buildTrayMenu(settings));
	}
	e.returnValue = 'true';
});

electron.ipcMain.on('app.quit', function(e) {
	Windows.main.destroy();
	electron.app.quit();
	e.returnValue = 'true';
});

electron.app.on('browser-window-created', function(e, w) {
	Windows.last = w;
});

electron.app.on('browser-window-focus', function(e, w) {
	Windows.last = w;
});

electron.app.on('activate', function() {
	Windows.last.show();
});

electron.app.on('window-all-closed', function() {
	electron.app.quit();
});
