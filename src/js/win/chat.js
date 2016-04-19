window.addEventListener('load', function(e) {
	'use strict';

	Remote.getCurrentWindow().setMenu(Remote.Menu.buildFromTemplate([
		{
			label: 'Buddy',
			submenu: [
				{
					label: 'View Devices',
					click: function() {
						IPCRenderer.send(
							'deviceManager.create',
							thisChat.window.state.to
						);
					}
				},
				{
					label: 'Send File',
					accelerator: 'alt+F',
					click: function() {
						thisChat.window.sendFileDialog();
					}
				},
				{
					label: 'Record Audio/Video',
					accelerator: 'alt+R',
					click: function() {
						thisChat.window.record();
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Close',
					accelerator: 'CmdOrCtrl+W',
					click: function() {
						Remote.getCurrentWindow().close();
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
			label: 'View',
			submenu: [{
				label: 'Increase Font Size',
				accelerator: 'CmdOrCtrl+Plus',
				click: function() {
					thisChat.window.increaseFontSize();
				}
			}, {
				label: 'Decrease Font Size',
				accelerator: 'CmdOrCtrl+-',
				click: function() {
					thisChat.window.decreaseFontSize();
				}
			}, {
				label: 'Reset Font Size',
				accelerator: 'CmdOrCtrl+0',
				click: function() {
					thisChat.window.resetFontSize();
				}
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
				label: 'Check for Updates',
				click: function() {
					IPCRenderer.send(
						'main.checkForUpdates'
					);
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

	var getTimestamp = function(stamp) {
		var date = new Date(stamp);
		var h = date.getHours();
		var m = date.getMinutes();
		var d = date.getDate();
		var a = [
			'Jan', 'Feb', 'Mar',
			'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep',
			'Oct', 'Nov', 'Dec'
		][date.getMonth()];
		var s = ' am';
		if (h > 12) {
			h = h - 12;
			s = ' pm';
		}
		if (m < 10) {
			m = '0' + m;
		}
		return (
			d + ' ' + a + '., ' +
			h + ':' + m + s
		);
	};

	var checkIfSticker = function(message) {
		if (Cryptocat.Patterns.sticker.test(message)) {
			var stickers = [
				'angry',    'blushing',  'challengeAccepted',
				'confused', 'crying',    'embarrassed',
				'grinning', 'hurt',      'inLove',
				'nerdy',    'sarcastic', 'sick',
				'sleepy',   'smiling',   'winking'
			];
			var sticker = message.substr(17);
			if (stickers.indexOf(sticker) >= 0) {
				return {
					sticker:   sticker,
					isSticker: true
				}
			}
		}
		return {
			sticker:   '',
			isSticker: false
		}
	};

	var checkIfFile = function(message) {
		if (Cryptocat.Patterns.file.test(message)) {
			var info = Cryptocat.File.parseInfo(message);
			if (info.valid) {
				return {
					file:   info,
					isFile: true
				}
			}
		}
		return {
			file:   {},
			isFile: false
		}
	};

	var checkIfRecording = function(message) {
		if (Cryptocat.Patterns.recording.test(message)) {
			var info = Cryptocat.File.parseInfo(message);
			if (
				info.valid &&
				(info.name === 'recording.webm')
			) {
				return {
					recording:   info,
					isRecording: true
				}
			}
		}
		return {
			recording:   {},
			isRecording: false
		}
	};

	var chatSticker = React.createClass({
		displayName: 'chatSticker',
		getInitialState: function() {
			return {};
		},
		componentDidMount: function() {
			return true;
		},
		render: function() {
			return React.createElement('div', {
				className: 'chatSticker',
				'data-alignment': this.props.alignment,
				key: 0
			}, React.createElement('img', {
				src: '../img/stickers/' + this.props.sticker + '.png',
				key: 1
			}));
		}
	});

	var chatFile = React.createClass({
		displayName: 'chatFile',
		getInitialState: function() {
			return {
				progress: 0,
				valid: true,
				binary: new Buffer([]),
				saved: false
			}
		},
		componentDidMount: function() {
			return true;
		},
		onClick: function() {
			if (
				(!this.state.ready) ||
				(this.state.binary.length < 1)
			) {
				return false;
			}
			var _t = this;
			Cryptocat.Diag.save.sendFile(
				Remote.getCurrentWindow(),
				_t.props.file.name,
				function(path) {
					if (!path) { return false; }
					FS.writeFile(path, _t.state.binary, function() {
						_t.setState({saved: true});
					})
				}
			);
		},
		render: function() {
			return React.createElement('div', {
				className: 'chatFile',
				'data-alignment': this.props.alignment,
				'data-offline': this.props.offline,
				key: 0
			}, React.createElement('img', {
				className: 'chatFileIcon',
				src: '../img/files/' + this.props.file.type + '.png',
				onClick: this.onClick,
				key: 1
			}), React.createElement('div', {
				className: 'chatFileProgressBar',
				key: 2,
				'data-valid': this.state.valid,
				'data-complete': (
					this.state.ready &&
					this.state.valid
				)
			}, React.createElement('div', {
				className: 'chatFileProgressBarIndicator',
				style: {
					width: this.state.progress + '%'
				},
				key: 3
			})));
		}
	});

	var chatMessage = React.createClass({
		displayName: 'chatMessage',
		getInitialState: function() {
			return {};
		},
		componentDidMount: function() {
			return true;
		},
		render: function() {
			var className = 'chatMessage';
			return React.createElement('div', {
				className: 'chatMessage',
				'data-alignment': this.props.alignment,
				'data-offline': this.props.offline,
				'data-valid': this.props.valid,
				key: 0
			}, React.createElement('span', {
				className: 'chatMessageInfo',
				key: 1
			}, React.createElement('span', {
				className: 'chatMessageSender',
				key: 2
			}, this.props.sender),
			React.createElement('span', {
				className: 'chatMessageTimestamp',
				key: 3
			}, this.props.timestamp)),
			this.props.message);
		}
	});

	var chatRecording = React.createClass({
		displayName: 'chatRecording',
		getInitialState: function() {
			return {
				progress: 0,
				ready: false,
				valid: true,
				src: '../img/icons/loading.webm',
				saved: false
			}
		},
		componentDidMount: function() {
			return true;
		},
		render: function() {
			var className = 'chatRecording';
			return React.createElement('div', {
				className: 'chatRecording',
				'data-alignment': this.props.alignment,
				'data-offline': this.props.offline,
				key: 0
			}, React.createElement('span', {
				className: 'chatRecordingInfo',
				key: 1
			}, React.createElement('span', {
				className: 'chatRecordingSender',
				key: 2
			}, this.props.sender),
			React.createElement('span', {
				className: 'chatRecordingTimestamp',
				key: 3
			}, this.props.timestamp)),
			React.createElement('video', {
				className: 'chatRecordingVideo',
				src: this.state.src,
				autoPlay: !this.state.ready,
				controls: this.state.ready,
				loop: !this.state.ready,
				key: 4
			}));
		}
	});

	var chatWindow = React.createClass({
		displayName: 'chatWindow',
		getInitialState: function() {
			return {
				recordVisible:   false,
				status:         -1,
				key:             0,
				unread:          0,
				recordTime:      0,
				recordCountdown: 3,
				fontSize:       13,
				chatInputText:   '',
				myChatState:     'paused',
				theirChatState:  'paused',
				to:              '',
				recordSrc:       '',
				conversation:    [],
				recordTimer:     {}
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentDidUpdate: function() {	
		},
		onChangeChatInputText: function(e) {
			this.setState({chatInputText: e.target.value});
		},
		onSubmit: function() {
			var message = this.state.chatInputText;
			if (!message.length) { return false; };
			this.setState({chatInputText: ''});
			thisChat.sendQueue.messages.push(message);
			if (!thisChat.sendQueue.isOn) {
				thisChat.sendQueue.turnOn();
			}
			this.updateConversation(true, {
				plaintext: message,
				valid: true,
				stamp: (new Date()).toString(),
				offline: (this.state.status !== 2)
			});
			return false;
		},
		files: {},
		recordings: {},
		updateConversation: function(fromMe, info) {
			var _t        = this;
			var sender    = this.state.to;
			var alignment = (function() {
				if (fromMe) {
					sender = Cryptocat.Me.username;
					return 'right';
				}
				return 'left';
			})();
			var sticker   = checkIfSticker(info.plaintext);
			var file      = checkIfFile(info.plaintext);
			var recording = checkIfRecording(info.plaintext);
			if (sticker.isSticker) {
				var res = React.createElement(chatSticker, {
					key: this.state.key,
					alignment: alignment,
					sticker: sticker.sticker,
				});
			}
			else if (file.isFile) {
				var res = React.createElement(chatFile, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					timestamp: getTimestamp(info.stamp),
					file: file.file,
					offline: info.offline,
					ref: function(f) {
						_t.files[file.file.url] = f;
						if (!fromMe) {
							_t.receiveFile(file.file);
						}
					}
				});
			}
			else if (recording.isRecording) {
				var res = React.createElement(chatRecording, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					timestamp: getTimestamp(info.stamp),
					offline: info.offline,
					ref: function(r) {
						_t.recordings[recording.recording.url] = r;
						if (!fromMe) {
							_t.receiveRecording(recording.recording);
						}
					}
				});
			}
			else {
				var res = React.createElement(chatMessage, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					message: info.plaintext,
					timestamp: getTimestamp(info.stamp),
					valid: info.valid,
					offline: info.offline
				});
			}
			this.setState({
				conversation: this.state.conversation.concat([
					res
				]),
				key: this.state.key + 1
			}, function() {
				thisChat.contents().scrollTop = 
						thisChat.contents().scrollHeight;
				setTimeout(function() {
					thisChat.contents().scrollTop = 
						thisChat.contents().scrollHeight;
				}, 50);
			})
		},
		sendSticker: function(e) {
			var sticker = 'CryptocatSticker:' + 
				e.target.getAttribute('data-sticker');
			e.target.blur();
			document.getElementById('chatInputText').focus();
			thisChat.sendQueue.messages.push(sticker);
			if (!thisChat.sendQueue.isOn) {
				thisChat.sendQueue.turnOn();
			}
			this.updateConversation(true, {
				plaintext: sticker,
				valid: true,
				stamp: (new Date()).toString(),
				offline: (this.state.status !== 2)
			});
		},
		record: function(e) {
			var _t = this;
			if (!this.state.recordVisible) {
				Cryptocat.Recording.createStream(function(stream) {
					thisChat.window.setState({
						recordCountdown: 3,
						recordVisible: true,
						recordSrc: URL.createObjectURL(stream)
					});
					setTimeout(function() {
						thisChat.window.setState({
							recordCountdown: 2
						});
					}, 2000);
					setTimeout(function() {
						thisChat.window.setState({
							recordCountdown: 1
						});
					}, 3000);
					setTimeout(function() {
						thisChat.window.setState({
							recordCountdown: 0
						});
						Cryptocat.Recording.start();
						thisChat.window.setState({
							recordTimer: setInterval(function() {
								thisChat.window.setState({
									recordTime: thisChat.window.state.recordTime + 1
								});
							}, 1000)
						});
					}, 4000);
				});
			}
			else {
				Cryptocat.Recording.stop(function(video) {
					URL.revokeObjectURL(
						thisChat.window.state.recordSrc
					);
					thisChat.window.setState({
						recordSrc: '',
						recordVisible: false,
						recordTime: 0,
						recordTimer: clearInterval(
							thisChat.window.state.recordTimer
						),
						recordCountdown: 3
					});
				});
			}
		},
		sendRecording: function(e) {
			var _t = this;
			Cryptocat.Recording.stop(function(video) {
				URL.revokeObjectURL(
					thisChat.window.state.recordSrc
				);
				var recordTime = thisChat.window.state.recordTime;
				thisChat.window.setState({
					recordSrc: '',
					recordVisible: false,
					recordTime: 0,
					recordTimer: clearInterval(
						thisChat.window.state.recordTimer
					),
					recordCountdown: 3
				});
				if (recordTime > 65) {
					Cryptocat.Diag.error.recordTime();
					return false;
				}
				Cryptocat.File.send('recording.webm', video, function(info) {	
					if (!info.valid) {
						return false;
					}
					var sendInfo = 'CryptocatReco:' + JSON.stringify(info);
					_t.updateConversation(true, {
						plaintext: sendInfo,
						valid: true,
						stamp: (new Date()).toString(),
						offline: (_t.state.status !== 2),
					});
				}, function(url, p) {
					_t.recordings[url].setState({progress: p});
					Remote.getCurrentWindow().setProgressBar(p / 100);
				}, function(info, file) {
					var sendInfo = 'CryptocatReco:' + JSON.stringify(info);
					if (info.valid) {
						thisChat.sendQueue.messages.push(sendInfo);
						if (!thisChat.sendQueue.isOn) {
							thisChat.sendQueue.turnOn();
						}
					}
					else {
						Cryptocat.Diag.error.recordingGeneral();
					}
					_t.recordings[info.url].setState({
						progress: 100,
						ready: true,
						valid: info.valid,
						src: URL.createObjectURL(
							new Blob([file], {
								type: 'video/webm'
							})
						)
					});
					Remote.getCurrentWindow().setProgressBar(0);
				});
			});
		},
		sendFileDialog: function(e) {
			var _t = this;
			document.getElementById('chatInputText').focus();
			Cryptocat.Diag.open.sendFile(
				Remote.getCurrentWindow(), function(path) {
					if (!path) {
						return false;
					}
					_t.sendFile(path[0]);
				}
			);
		},
		sendFile: function(path) {
			var _t = this;
			var name = (require('path')).basename(path);
			FS.readFile(path, function(err, file) {
				if (err) {
					Cryptocat.Diag.error.fileGeneral();
				}
				Cryptocat.File.send(name, file, function(info) {	
					if (!info.valid) {
						return false;
					}
					var sendInfo = 'CryptocatFile:' + JSON.stringify(info);
					_t.updateConversation(true, {
						plaintext: sendInfo,
						valid: true,
						stamp: (new Date()).toString(),
						offline: (_t.state.status !== 2)
					});
				}, function(url, p) {
					_t.files[url].setState({progress: p});
					Remote.getCurrentWindow().setProgressBar(p / 100);
				}, function(info, file) {
					var sendInfo = 'CryptocatFile:' + JSON.stringify(info);
					if (info.valid) {
						thisChat.sendQueue.messages.push(sendInfo);
						if (!thisChat.sendQueue.isOn) {
							thisChat.sendQueue.turnOn();
						}
					}
					else {
						Cryptocat.Diag.error.fileGeneral();
					}
					_t.files[info.url].setState({
						progress: 100,
						ready: true,
						valid: info.valid,
						binary: file
					});
					Remote.getCurrentWindow().setProgressBar(0);
				});
			});
		},
		receiveFile: function(file) {
			var _t = this;
			Cryptocat.File.receive(file, function(url, p) {
				_t.files[url].setState({progress: p});
				Remote.getCurrentWindow().setProgressBar(p / 100);
			}, function(url, plaintext, valid) {
				if (!valid) {
					Cryptocat.Diag.error.fileSave();
				}
				_t.files[url].setState({
					binary: plaintext,
					progress: 100,
					ready: true,
					valid: valid
				});
				Remote.getCurrentWindow().setProgressBar(0);
			});
		},
		receiveRecording: function(recording) {
			var _t = this;
			Cryptocat.File.receive(recording, function(url, p) {
				_t.recordings[url].setState({progress: p});
				Remote.getCurrentWindow().setProgressBar(p / 100);
			}, function(url, video, valid) {
				if (!valid) {
					Cryptocat.Diag.error.fileSave();
				}
				_t.recordings[url].setState({
					src: URL.createObjectURL(
						new Blob([video], {
							type: 'video/webm'
						})
					),
					progress: 100,
					ready: true,
					valid: valid
				});
				Remote.getCurrentWindow().setProgressBar(0);
			});
		},
		increaseFontSize: function() {
			this.setState({
				fontSize: this.state.fontSize + 1
			});
		},
		decreaseFontSize: function() {
			this.setState({
				fontSize: this.state.fontSize - 1
			});
		},
		resetFontSize: function() {
			this.setState({
				fontSize: 13
			});
		},
		statusMessages: [
			' is offline and cannot receive messages.',
			' is offline and can receive messages.',
			' is online.'
		],
		render: function() {
			var _t = this;
			return React.createElement('div', {}, [
				React.createElement('div', {
					key: 0,
					id: 'chatTop'
				}, React.createElement('div', {
					key: 1,
					className: 'chatTopStatus',
					'data-status': this.state.status,
					'data-theirchatstate': this.state.theirChatState
				}, (function() {
					if (_t.state.theirChatState === 'composing') {
						return _t.state.to + ' is typing...';
					}
					return _t.state.to + _t.statusMessages[_t.state.status];
				})())),
				React.createElement('div', {
					key: 2,
					id: 'chatContents',
					style: {
						'font-size': this.state.fontSize + 'px'
					}
				}, this.state.conversation),
				React.createElement('div', {
					key: 3,
					id: 'chatBottom'
				}, React.createElement('form', {
					key: 4,
					id: 'chatInput',
					onSubmit: this.onSubmit
				}, React.createElement('div', {
					className: 'chatToolbar',
					key: 5
				},	React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'smiling',
					title: 'Smiling',
					onClick: this.sendSticker,
					key: 6
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'grinning',
					onClick: this.sendSticker,
					title: 'Grinning',
					key: 7
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'winking',
					onClick: this.sendSticker,
					title: 'Winking',
					key: 8
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'inLove',
					onClick: this.sendSticker,
					title: 'In Love',
					key: 9
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'embarrassed',
					onClick: this.sendSticker,
					title: 'Embarrassed',
					key: 10
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'nerdy',
					onClick: this.sendSticker,
					title: 'Nerdy',
					key: 11
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'challengeAccepted',
					onClick: this.sendSticker,
					title: 'Challenge Accepted!',
					key: 12
				}), React.createElement('div', {
					className: 'recordModal',
					'data-visible': this.state.recordVisible,
					key: 13
				}, React.createElement('div', {
					className: 'recordModalCountdown',
					'data-visible': !!this.state.recordCountdown,
					key: 14
				}, this.state.recordCountdown),
				React.createElement('video', {
					className: 'recordModalVideo',
					controls: false,
					src: this.state.recordSrc,
					autoPlay: true,
					muted: true,
					key: 15
				}), React.createElement('div', {
					className: 'recordModalControls',
					key: 16
				}, React.createElement('input', {
					type: 'button',
					className: 'recordModalSend',
					onClick: this.sendRecording,
					key: 17
				}), React.createElement('input', {
					type: 'button',
					className: 'recordModalCancel',
					onClick: this.record,
					key: 18
				}), React.createElement('div', {
					className: 'recordModalDuration',
					key: 19
				}, React.createElement('div', {
					className: 'recordModalDurationIndicator',
					'data-blinking': (this.state.recordTime >= 50),
					style: {
						width: ((this.state.recordTime * 100) / 60) + '%'
					},
					key: 20
				})))), React.createElement('input', {
					type: 'button',
					className: 'recordButton',
					onClick: this.record,
					title: 'Record Audio/Video',
					'data-active': this.state.recordVisible,
					key: 21
				}), React.createElement('input', {
					type: 'button',
					className: 'sendFileButton',
					onClick: this.sendFileDialog,
					title: 'Send File',
					key: 22
				})), React.createElement('textarea', {
					key: 23,
					id: 'chatInputText',
					style: {
						'font-size': this.state.fontSize + 'px'
					},
					autoFocus: true,
					form: 'chatInput',
					placeholder: 'Type in your message...',
					onChange: this.onChangeChatInputText,
					disabled: (this.state.status === 0),
					'data-enabled': !!this.state.status,
					value: this.state.chatInputText
				})))
			]);
		}
	})

	var thisChat = {
		window: ReactDOM.render(
			React.createElement(chatWindow, null),
			document.getElementById('chatWindow')
		),
		contents: function() {
			return document.getElementById('chatContents');
		},
		focused: true,
		theirComposingTimer: {},
		myComposingTimer: {},
		sendQueue: {
			messages: [],
			monitor:  {},
			isOn: false,
			lastRecv: 0,
			turnOn: function() {
				thisChat.sendQueue.monitor = setInterval(function() {
					if (!thisChat.sendQueue.messages.length) {
						thisChat.sendQueue.turnOff();
						return false;
					}
					if ((Date.now() - thisChat.sendQueue.lastRecv) < 500) {
						return false;
					}
					IPCRenderer.sendSync(
						'chat.sendMessage',
						thisChat.window.state.to,
						thisChat.sendQueue.messages[0]
					);
					thisChat.sendQueue.messages.splice(0, 1);
				}, 500);
				thisChat.sendQueue.isOn = true;
			},
			turnOff: function() {
				clearInterval(thisChat.sendQueue.monitor);
				thisChat.sendQueue.isOn = false;
			}
		}
	};

	IPCRenderer.once('chat.init', function(e, data) {
		Cryptocat.Me.username = data.myUsername;
		thisChat.window.setState({
			status: data.status,
			to: data.theirUsername
		});
		document.getElementById('chatInputText').focus();
	});

	IPCRenderer.on('chat.status', function(e, status) {
		thisChat.window.setState({status: status});
	});

	IPCRenderer.on('chat.theirChatState', function(e, chatState) {
		thisChat.window.setState({theirChatState: chatState});
		clearTimeout(thisChat.theirComposingTimer);
		if (chatState === 'composing') {
			thisChat.theirComposingTimer = setTimeout(function() {
				thisChat.window.setState({theirChatState: 'paused'});
			}, 30000);
		}
	});

	IPCRenderer.on('chat.receiveMessage', function(e, info) {
		thisChat.window.updateConversation(false, info);
		thisChat.sendQueue.lastRecv = (new Date(info.stamp)).getTime();
		if (!thisChat.focused && (process.platform === 'darwin')) {
			thisChat.window.setState({
				unread: thisChat.window.state.unread + 1
			});
			var badgeCount = parseInt(Remote.app.dock.getBadge());
			if (isNaN(badgeCount)) { badgeCount = 0; }
			Remote.app.dock.setBadge((badgeCount + 1).toString());
			Remote.app.dock.bounce();
		}
	});

	Mousetrap(
		document.getElementById('chatInputText')
	).bind('enter', function(e, combo) {
		e.preventDefault();
		thisChat.window.onSubmit();
	});

	('1234567890qwertyuiopasdfghjklzxcvbnm.'.split('')).forEach(function(k) {
		Mousetrap(
			document.getElementById('chatInputText')
		).bind(k, function(e, combo) {
			if (thisChat.window.state.myChatState === 'paused') {
				thisChat.window.setState(
					{myChatState: 'composing'}, function() {
						IPCRenderer.send(
							'chat.myChatState',
							thisChat.window.state.to,
							'composing'
						);
					}
				);
			}
			clearTimeout(thisChat.myComposingTimer);
			thisChat.myComposingTimer = setTimeout(function() {
				thisChat.window.setState({myChatState: 'paused'});
					IPCRenderer.send(
						'chat.myChatState',
						thisChat.window.state.to,
						'paused'
					);
			}, 3000);
		});
	});

	window.addEventListener('focus', function(e) {
		document.getElementById('chatInputText').focus();
		if (process.platform !== 'darwin') {
			return false;
		}
		var badgeCount = parseInt(Remote.app.dock.getBadge());
		if (isNaN(badgeCount)) { badgeCount = 0; }
		badgeCount = badgeCount - thisChat.window.state.unread;
		if (badgeCount <= 0) { badgeCount = ''; }
		Remote.app.dock.setBadge(badgeCount.toString());
		thisChat.window.state.unread  = 0;
		thisChat.focused = true;
	});

	window.addEventListener('blur', function(e) {
		thisChat.focused = false;
	});

	window.addEventListener('resize', function(e) {
		thisChat.contents().style.height = (window.innerHeight - 135) + 'px';
	}); window.dispatchEvent(new Event('resize'));

	window.addEventListener('beforeunload', function(e) {
		for (var recording in thisChat.window.recordings) {
			if (
				hasProperty(thisChat.window.recordings, recording) &&
				!thisChat.window.recordings[recording].state.ready
			) {
				e.returnValue = 'false';
				Cryptocat.Diag.message.pendingRecordings(function(response) {
					if (response === 1) {
						Remote.getCurrentWindow().destroy();
					}
				});
				break;
			}
		}
		for (var file in thisChat.window.files) {
			if (
				hasProperty(thisChat.window.files, file) &&
				(thisChat.window.files[file].props.sender !== Cryptocat.Me.username) &&
				!thisChat.window.files[file].state.saved
			) {
				e.returnValue = 'false';
				Cryptocat.Diag.message.unsavedFiles(function(response) {
					if (response === 1) {
						Remote.getCurrentWindow().destroy();
					}
				});
				break;
			}
			else if (
				hasProperty(thisChat.window.files, file) &&
				(thisChat.window.files[file].props.sender === Cryptocat.Me.username) &&
				(thisChat.window.files[file].state.progress < 100)
			) {
				e.returnValue = 'false';
				Cryptocat.Diag.message.unsentFiles(function(response) {
					if (response === 1) {
						Remote.getCurrentWindow().destroy();
					}
				});
				break;
			}
		}
		if (thisChat.sendQueue.messages.length) {
			Cryptocat.Diag.error.messagesQueued(
				thisChat.sendQueue.messages.length
			);
			e.returnValue = 'false';
		}
	});

	var dragCounter = 0;
	document.addEventListener('dragenter', function(e) {
		e.stopPropagation();
		e.preventDefault();
		document.getElementById('chatFileDragOverlay').dataset.visible = true;
		dragCounter++;
		return false;
	}, false);
	document.addEventListener('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		return false;
	}, false);
	document.addEventListener('dragleave', function(e) {
		e.stopPropagation();
		e.preventDefault();
		dragCounter--;
		if (!dragCounter) {
			document.getElementById('chatFileDragOverlay').dataset.visible = false;
		}
	}, false);
	document.addEventListener('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		dragCounter = 0;
		document.getElementById('chatFileDragOverlay').dataset.visible = false;	
		if (e.isTrusted) {
			thisChat.window.sendFile(e.dataTransfer.files[0].path);
		}
		return false;
	}, false);

});

