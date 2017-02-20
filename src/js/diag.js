'use strict';
Cryptocat.Diag = {};

Cryptocat.Diag.error = {
	addBuddyAdded() {
		Dialog.showErrorBox(
			`Cryptocat: Buddy Already Added`,
			`This buddy is already in your buddy list. Please ` +
			`remove them first if you wish to add them again. ` +
			`You may do so by right clicking on the buddy and ` +
			`selecting "Remove Buddy".`
		);
	},

	addBuddyValidation() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Buddy Username`,
			`Please check that your buddy's username is valid.`
		);
	},

	addBuddySelf() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Add Yourself`,
			`You cannot add yourself to your own buddy list.`
		);
	},

	addDeviceValidation() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Device Name`,
			`Please check that your device name contains only numbers and letters.`
		);
	},

	changePasswordValidation() {
		Dialog.showErrorBox(
			`Cryptocat: Invalid Password`,
			`Please check that your password is at least 12 characters long ` +
			`and that the same password is entered in both fields.`
		);
	},

	checkCertificate() {
		Dialog.showErrorBox(
			`Cryptocat: Security Error`,
			`Cryptocat cannot securely validate the identity of the Cryptocat ` +
			`server. In order to protect your account, the client will now quit. ` +
			`It is possible that your network connection is being tampered with.`
		);
	},

	createAccount() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Create Account`,
			`You must be connected to the Internet in order to create ` +
			`a Cryptocat account.`
		);
	},

	fileExt(name) {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Send File`,
			`"${name}"'s file type is not supported. You can still ` +
			`send this file by first adding it to a Zip archive.`
		);
	},

	fileGeneral(name) {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Send File`,
			`"${name}" could not be sent. The file type could be ` +
			`unsupported or there could be a network error.`
		);
	},

	fileMaxSize(name) {
		Dialog.showErrorBox(
			`Cryptocat: File Too Large`,
			`"${name}" is too large to be sent over Cryptocat.`
		);
	},

	loginDisconnect(name) {
		Dialog.showErrorBox(
			`Cryptocat: Connection Error`,
			`Could not connect to Cryptocat. Please try again.`
		);
	},

	loginInvalid() {
		Dialog.showErrorBox(
			`Cryptocat: Login Error`,
			`Please check that you have entered a valid username and password.`
		);
	},

	messagesQueued(count) {
		Dialog.showErrorBox(
			`Cryptocat: ${count} Messages Queued`,
			`Cryptocat is still sending ${count} messages. ` +
			`Please try closing this chat window again in a few seconds.`
		);
	},

	messageSending() {
		Dialog.showErrorBox(
			`Cryptocat: Message Cannot Be Sent`,
			`Your message could not be sent due to an error. ` +
			`Please try again later.`
		);
	},

	noDevices(username) {
		Dialog.showErrorBox(
			`Cryptocat: No Trusted Devices for ${username}`,
			`You chose to send messages only to ${username}'s trusted devices, ` +
			`but you did not select any of their current devices as trusted. ` +
			`As such, your message could not be sent.\n\n` +
			`Please open ${username}'s device manager ` +
			`and either disable sending only to trusted devices, ` +
			`or mark at least one of their devices as trusted.`
		);
	},

	offline() {
		Dialog.showErrorBox(
			`Cryptocat: Must be Logged in`,
			`You must be logged into your Cryptocat ` +
			`account in order to perform this action.`
		);
	},

	recordingGeneral() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Error`,
			`Your recording could not be sent. Please try again later.`
		);
	},

	recordingInput() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Error`,
			`Cryptocat could not detect a webcam or microphone on this computer.`
		);
	},

	recordTime() {
		Dialog.showErrorBox(
			`Cryptocat: Recording Too Long`,
			`Your recording exceeds the allowed time limit of ` +
			`60 seconds. It cannot be sent. The small red bar ` +
			`indicates how much time you have left for your recording.`
		);
	},

	updateCheck() {
		Dialog.showErrorBox(
			`Cryptocat: Cannot Check for Updates`,
			`Cryptocat was unable to check for updates. ` +
			`Please make sure you are online: Keeping your ` +
			`Cryptocat client up to date is important.`
		);
	},

	updateDownloader() {
		Dialog.showErrorBox(
			`Cryptocat: Update Download Failed`,
			`Your Cryptocat update could not be downloaded. Please ` +
			`check your Internet connection and try again.`
		);
	}
};

Cryptocat.Diag.message = {
	about() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`, `Learn more`, `License`],
			defaultId: 0,
			title: `About Cryptocat`,
			message: `Cryptocat ${Cryptocat.Version}\n` +
				`Authored by Nadim Kobeissi.\n\n` +
				`Distributed as free software under the GNU General ` +
				`Public License (version 3).`
		}, (response) => {
			if (response === 1) {
				Remote.shell.openExternal(`https://${Cryptocat.Hostname}`);
			}
			if (response === 2) {
				Remote.shell.openExternal(
					`http://www.gnu.org/licenses/quick-guide-gplv3.en.html`
				);
			}
		});
	},

	addBuddyRequest(username, callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Accept`, `Deny`, `Remind me later`],
			defaultId: 2,
			title: `Cryptocat: Buddy Request!`,
			message: `${username} would like to be your buddy. ` +
				`Accept their request?`
		}, callback);
	},

	addBuddySuccess() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Success!`,
			message: `Your buddy request has been sent.`
		});
	},

	buddyUnsubscribed(username) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: ${username} Removed You`,
			message: `"${username}"has removed you from their buddy list.`
		});
	},

	changePasswordSuccess() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Password Changed`,
			message: `Your password has been successfully changed.`
		});
	},

	deleteAccount(username, callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Cancel`, `Learn more`, `Delete account`],
			defaultId: 0,
			title: `Cryptocat: Delete Account?`,
			message: `Are you sure you want to permanently delete ` +
				`this account (${username})?\n\n` +
				`* Your data will be permanently lost.\n` +
				`* Others will be able to register your username.\n` +
				`* Your device keys will not be automatically deleted.`
		}, (response) => {
			if (response === 1) {
				Remote.shell.openExternal(
					`https://${Cryptocat.Hostname}/help.html#deleteAccount`
				);
			}
			if (response === 2) {
				Dialog.showMessageBox({
					type: `question`,
					icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
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
	},

	deviceSetup(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Continue`, `Learn more`, `Quit`],
			defaultId: 0,
			title: `Cryptocat: Logging in from New Device`,
			message: `You are logging into your Cryptocat account ` +
				`from a new computer.\n \n` +
				`Doing so will add this computer to your list of trusted devices ` +
				`and store sensitive encryption keys in your user profile.\n\n` +
				`Continue and add this computer as a trusted device?`
		}, callback);
	},

	isLatest(version) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: No Updates Available`,
			message: `You are running the latest version of Cryptocat ` +
				`(${version}).`
		});
	},

	rememberIsChecked() {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Remembering Login`,
			message: `Only enable this feature on computers you trust.\n` +
				`Others with access to this computer may ` +
				`also be able to login with this username.`
		});
	},

	removeBuddyConfirm(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Remove buddy`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove Buddy?`,
			message: `Are you sure you would like to remove this buddy?`
		}, callback);
	},

	removeDevice(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Remove device`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove another device?`,
			message: `You are removing one your devices. ` +
				`Note that the keys on the remote devices will not be deleted. ` +
				`If you log back in from this device, it will be re-added to your ` +
				`device list. Proceed?`
		}, callback);
	},

	removeThisDevice(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Remove device`, `Cancel`],
			defaultId: 1,
			title: `Cryptocat: Remove this device?`,
			message: `You are removing the device you are currently logged in from. ` +
				`This will delete the keys stored on this device and log you out. Proceed?`
		}, callback);
	},

	unsavedFiles(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Return to Chat`, `Close Anyway`],
			defaultId: 0,
			title: `Cryptocat: Unsaved Files`,
			message: `You have received files in this chat that you have not ` +
				`yet saved. Are you sure you want to discard them?`
		}, callback);
	},

	unsentFiles(callback) {
		Dialog.showMessageBox({
			type: `question`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Return to Chat`, `Close Anyway`],
			defaultId: 0,
			title: `Cryptocat: Unsent Files`,
			message: `You have files in this conversation that are still ` +
				`being sent. Are you sure you want to discard them?`
		}, callback);
	},

	updateAvailable(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`Download now`, `What's new`, `Remind me later`],
			defaultId: 0,
			title: `Cryptocat: Update Available!`,
			message: `An update is available for Cryptocat. ` +
				`It is strongly recommended that you download now ` +
				`to enjoy new features, improved reliability and stronger security.`
		}, callback);
	},

	updatedDevices(username, callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`View devices`, `OK`],
			defaultId: 0,
			title: `Cryptocat: Updated devices for ${username}`,
			message: `${username} appears to have recently updated their device list. ` +
				`If this is unexpected, you may want to verify their devices.`
		}, callback);
	},

	updateDownloaded(callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`OK`],
			defaultId: 0,
			title: `Cryptocat: Update Downloaded`,
			message: `Cryptocat will now quit. Please open the downloaded ` +
				`package to install your Cryptocat update.`
		}, callback);
	},

	updatedMyDevices(username, callback) {
		Dialog.showMessageBox({
			type: `info`,
			icon: Path.join(Path.resolve(__gdirname, `..`, `img/logo`), `64x64.png`),
			buttons: [`View devices`, `OK`],
			defaultId: 0,
			title: `Cryptocat: Devices Updated`,
			message: `Your device list was recently updated. If this is unexpected, ` +
				`it is recommended that you view your device list and verify it.`
		}, callback);
	}
};
