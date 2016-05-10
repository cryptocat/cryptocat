'use strict';
Cryptocat.Diag = {
	error: {},
	message: {}
};

(function() {
	Cryptocat.Diag.error.addBuddyAdded = function() {
		Dialog.showErrorBox(
			`Cryptocat: Buddy Already Added`,
			`This buddy is already in your buddy list. Please ` +
			`remove them first if you wish to add them again. ` +
			`You may do so by right clicking on the buddy and ` +
			`selecting "Remove Buddy".`
		);
	};

	Cryptocat.Diag.error.addBuddyValidation = function() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Buddy Username`,
			`Please check that your buddy's username is valid.`
		);
	};

	Cryptocat.Diag.error.addBuddySelf = function() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Add Yourself`,
			`You cannot add yourself to your own buddy list.`
		);
	};

	Cryptocat.Diag.error.addDeviceValidation = function() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Device Name`,
			`Please check that your device name contains only numbers and letters.`
		);
	};

	Cryptocat.Diag.error.changePasswordValidation = function() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Password`,
			`Please check that your password is at least 12 characters long ` +
			`and that the same password is entered in both fields.`
		);
	};

	Cryptocat.Diag.error.checkCertificate = function() {
		Dialog.showErrorBox(
			`Cryptocat: Security Error`,
			`Cryptocat cannot securely validate the identity of the Cryptocat ` +
			`server. In order to protect your account, the client will now quit. ` +
			`It is possible that your network connection is being tampered with.`
		);
	};

	Cryptocat.Diag.error.createAccount = function() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Create Account`,
			`You must be connected to the Internet in order to create ` +
			`a Cryptocat account.`
		);
	};

	Cryptocat.Diag.error.fileExt = function(name) {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Send File`,
			`"${name}"\`s file type is not supported. You can still ` +
			`send this file by first adding it to a Zip archive.`
		);
	};

	Cryptocat.Diag.error.fileGeneral = function(name) {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Send File`,
			`"${name}" could not be sent. The file type could be ` +
			`unsupported or there could be a network error.`
		);
	};

	Cryptocat.Diag.error.fileMaxSize = function(name) {
		Dialog.showErrorBox(
			`Cryptocat: File Too Large`,
			`"${name}" is too large to be sent over Cryptocat.`
		);
	};

	Cryptocat.Diag.error.loginDisconnect = function() {
		Dialog.showErrorBox(
			`Cryptocat: Connection Error`,
			`Could not connect to Cryptocat. Please try again.`
		);
	};

	Cryptocat.Diag.error.loginInvalid = function() {
		Dialog.showErrorBox(
			`Cryptocat: Login Error`,
			`Please check that you have entered a valid username and password.`
		);
	};

	Cryptocat.Diag.error.messagesQueued = function(count) {
		Dialog.showErrorBox(
			`Cryptocat: ${count} Messages Queued`,
			`Cryptocat is still sending ${count} messages` +
			`Please try closing this chat window again in a few seconds.`
		);
	};

	Cryptocat.Diag.error.offline = function() {
		Dialog.showErrorBox(
			`Cryptocat: Must be Logged in`,
			`You must be logged into your Cryptocat ` +
			`account in order to perform this action.`
		);
	};

	Cryptocat.Diag.error.recordingGeneral = function() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Error`,
			`Your recording could not be sent. Please try again later.`
		);
	};

	Cryptocat.Diag.error.recordingInput = function() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Error`,
			`Cryptocat could not detect a webcam or microphone on this computer.`
		);
	};

	Cryptocat.Diag.error.recordTime = function() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Too Long`,
			`Your recording exceeds the allowed time limit of ` +
			`60 seconds. It cannot be sent. The small red bar ` +
			`indicates how much time you have left for your recording.`
		);
	};

	Cryptocat.Diag.error.updateCheck = function() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Check for Updates`,
			`Cryptocat was unable to check for updates. ` +
			`Please make sure you are online: Keeping your ` +
			`Cryptocat client up to date is important.`
		);
	};

	Cryptocat.Diag.error.updateDownloader = function() {
		Dialog.showErrorBox(
			`Cryptocat: Update Download Failed`,
			`Your Cryptocat update could not be downloaded. Please ` +
			`check your Internet connection and try again.`
		);
	};

	// ----------------------------------------------------
	// ----------------------------------------------------
	// ----------------------------------------------------

	Cryptocat.Diag.message.about = function() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`, `Learn more`, `License`],
			defaultId: 0,
			title: `About Cryptocat`,
			message: `Cryptocat ${Cryptocat.Version}, Beta release.\n` +
				`Authored by Nadim Kobeissi.\n\n` +
				`Distributed as free software under the GNU General ` +
				`Public License (version 3).\n\n` +
				`N. L.`
		}, function(response) {
			if (response === 1) {
				Remote.shell.openExternal(`https://crypto.cat`);
			}
			if (response === 2) {
				Remote.shell.openExternal(
					`http://www.gnu.org/licenses/quick-guide-gplv3.en.html`
				);
			}
		});
	};

	Cryptocat.Diag.message.addBuddyRequest = function(
		username, callback
	) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Accept`, `Deny`, `Remind me later`],
			defaultId: 2,
			title: `Cryptocat: Buddy Request!`,
			message: `${username} would like to be your buddy. ` +
				`Accept their request?`
		}, callback);
	};

	Cryptocat.Diag.message.addBuddySuccess = function() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Success!`,
			message: `Your buddy request has been sent.`
		});
	};

	Cryptocat.Diag.message.buddyUnsubscribed = function(username) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: ${username} Removed You`,
			message: `"${username}"has removed you from their buddy list.`
		});
	};

	Cryptocat.Diag.message.changePasswordSuccess = function() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Password Changed`,
			message: `Your password has been successfully changed.`
		});
	};

	Cryptocat.Diag.message.deleteAccount = function(username, callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Cancel`, `Learn more`, `Delete account`],
			defaultId: 0,
			title: `Cryptocat: Delete Account?`,
			message: `Are you sure you want to permanently delete ` +
				`this account (${username})?\n\n` +
				`* Your data will be permanently lost.\n` +
				`* Others will be able to register your username.\n` +
				`* Your device keys will not be automatically deleted.`
		}, function(response) {
			if (response === 1) {
				Remote.shell.openExternal(
					`https://crypto.cat/help.html#deleteAccount`
				);
			}
			if (response === 2) {
				Dialog.showMessageBox({
					type: `question`,
					icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
					buttons: [`Cancel`, `Learn more`, `Delete account`],
					defaultId: 0,
					title: `Cryptocat: Delete Account, Final Warning`,
					message: `You are about to delete: ${username}.\n\n` +
						`* Your data will be permanently lost.\n` +
						`* Others will be able to register your username.\n` +
						`* Your device keys will not be automatically deleted.`
				}, callback);
			}
		});
	};

	Cryptocat.Diag.message.deviceSetup = function(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Continue`, `Learn more`, `Quit`],
			defaultId: 0,
			title: `Cryptocat: Logging in from New Device`,
			message: `You are logging into your Cryptocat account ` +
				`from a new computer.\n \n` +
				`Doing so will add this computer to your list of trusted devices ` +
				`and store sensitive encryption keys in your user profile.\n\n` +
				`Continue and add this computer as a trusted device?`
		}, callback);
	};

	Cryptocat.Diag.message.isLatest = function(version) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: No Updates Available`,
			message: `You are running the latest version of Cryptocat ` +
				`(${version}).`
		});
	};

	Cryptocat.Diag.message.rememberIsChecked = function() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Remembering Login`,
			message: `Only enable this feature on computers you trust.\n` +
				`Others with access to this computer may ` +
				`also be able to login with this username.`
		});
	};

	Cryptocat.Diag.message.removeBuddyConfirm = function(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Remove buddy`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove Buddy?`,
			message: `Are you sure you would like to remove this buddy?`
		}, callback);
	};

	Cryptocat.Diag.message.removeDevice = function(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Remove device`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove another device?`,
			message: `You are removing one your devices. ` +
				`Note that the keys on the remote devices will not be deleted. ` +
				`If you log back in from this device, it will be re-added to your ` +
				`device list. Proceed?`
		}, callback);
	};

	Cryptocat.Diag.message.removeThisDevice = function(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Remove device`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove this device?`,
			message: `You are removing the device you are currently logged in from. ` +
				`This will delete the keys stored on this device and log you out. Proceed?`
		}, callback);
	};

	Cryptocat.Diag.message.unsavedFiles = function(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Return to Chat`, `Close Anyway`],
			defaultId: 0,
			title: `Cryptocat: Unsaved Files`,
			message: `You have received files in this chat that you have not ` +
				`yet saved. Are you sure you want to discard them?`
		}, callback);
	};

	Cryptocat.Diag.message.unsentFiles = function(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Return to Chat`, `Close Anyway`],
			defaultId: 0,
			title: `Cryptocat: Unsent Files`,
			message: `You have files in this conversation that are still ` +
				`being sent. Are you sure you want to discard them?`
		}, callback);
	};

	Cryptocat.Diag.message.updateAvailable = function(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`Download now`, `What\`s new`, `Remind me later`],
			defaultId: 0,
			title: `Cryptocat: Update Available!`,
			message: `An update is available for Cryptocat. ` +
				`It is strongly recommended that you download now ` +
				`to enjoy new features, improved reliability and stronger security.`
		}, callback);
	};

	Cryptocat.Diag.message.updatedDevices = function(username, callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`View devices`, `OK`],
			defaultId: 0,
			title: `Cryptocat: Updated devices for ${username}`,
			message: `${username} appears to have recently updated their device list. ` +
				`If this is unexpected, you may want to verify their devices.`
		}, callback);
	};

	Cryptocat.Diag.message.updateDownloaded = function(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Update Downloaded`,
			message: `Cryptocat will now quit. Please open the downloaded ` +
				`package to install your Cryptocat update.`
		}, callback);
	};

	Cryptocat.Diag.message.updatedMyDevices = function(username, callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `logo64.png`),
			buttons: [`View devices`, `OK`],
			defaultId: 0,
			title: `Cryptocat: Devices Updated`,
			message: `Your device list was recently updated. If this is unexpected, ` +
				`it is recommended that you view your device list and verify it.`
		}, callback);
	};
})();
