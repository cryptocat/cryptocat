/* jshint latedef: false */
'use strict';

window.addEventListener('load', function(e) {
	Remote.getCurrentWindow().setMenu(Remote.Menu.buildFromTemplate(
		[{
			label: 'Chat',
			submenu: [{
				label: 'View Devices',
				click: function() {
					IPCRenderer.send(
						'deviceManager.create',
						thisChat.window.state.to
					);
				}
			}, {
				label: 'Send File',
				accelerator: 'alt+F',
				click: function() {
					thisChat.window.sendFileDialog();
				}
			}, {
				label: 'Record Audio/Video',
				accelerator: 'alt+R',
				click: function() {
					thisChat.window.record();
				}
			}, {
				type: 'separator'
			}, {
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				click: function() {
					Remote.getCurrentWindow().close();
				}
			}]
		}, {
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
		}, {
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
		}, {
			label: 'Help',
			role: 'help',
			submenu: [{
				label: 'Getting Started',
				click: function() {
					Remote.shell.openExternal(
						`https://${Cryptocat.Hostname}/help.html`
					);
				}
			},/*{label:'Developer',click:function(i,f){f.toggleDevTools();}},*/{
				label: 'Report a Bug',
				click: function() {
					Remote.shell.openExternal(
						'https://github.com/cryptocat/cryptocat/issues/'
					);
				}
			}, {
				label: 'Check for Updates',
				click: function() {
					IPCRenderer.send(
						'main.checkForUpdates'
					);
				}
			}, {
				type: 'separator'
			}, {
				label: 'About Cryptocat',
				click: function() {
					Cryptocat.Diag.message.about();
				}
			}]
		}]
	));

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
				'angry', 'challengeAccepted', 'confused',
				'content', 'crying', 'grinning',
				'inLove', 'smiling'
			];
			var sticker = message.substr(17);
			if (stickers.indexOf(sticker) >= 0) {
				return {
					sticker: sticker,
					isSticker: true
				};
			}
		}
		return {
			sticker: '',
			isSticker: false
		};
	};

	var checkIfFile = function(message) {
		if (Cryptocat.Patterns.file.test(message)) {
			var info = Cryptocat.File.parseInfo(message);
			if (info.valid) {
				return {
					file:	info,
					isFile: true
				};
			}
		}
		return {
			file:	{},
			isFile: false
		};
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
				draggable: false,
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
			};
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
			IPCRenderer.send(
				'chat.saveDialog',
				thisChat.window.state.to,
				_t.props.file.name,
				_t.props.file.url
			);
			this.setState({saved: true});
		},
		render: function() {
			return React.createElement('div', {
				className: 'chatFile',
				'data-alignment': this.props.alignment,
				'data-offline': this.props.offline,
				key: 0
			}, React.createElement('span', {
				className: 'chatFileInfo',
				key: 1
			}, React.createElement('span', {
				className: 'chatFileSender',
				key: 2
			}, this.props.sender),
			React.createElement('span', {
				className: 'chatFileDeviceName',
				'data-visible': !!this.props.deviceName.length,
				key: 3
			}, '(' + this.props.deviceName + ')'),
			React.createElement('span', {
				className: 'chatFileTimestamp',
				key: 4
			}, this.props.timestamp)),
			React.createElement('img', {
				className: 'chatFileIcon',
				src: '../img/files/' + this.props.file.type + '.png',
				onClick: this.onClick,
				key: 5
			}), React.createElement('div', {
				className: 'chatFileProgressBar',
				key: 6,
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
				key: 7
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
				className: 'chatMessageDeviceName',
				'data-visible': !!this.props.deviceName.length,
				key: 3
			}, '(' + this.props.deviceName + ')'),
			React.createElement('span', {
				className: 'chatMessageTimestamp',
				key: 4
			}, this.props.timestamp)),
			this.props.message);
		}
	});

	var chatMedia = React.createClass({
		displayName: 'chatMedia',
		getInitialState: function() {
			return {
				progress: 0,
				ready: false,
				valid: true,
				saved: false,
				binary: new Buffer([])
			};
		},
		componentDidMount: function() {
			return true;
		},
		onContextMenu: function(e) {
			var _t = this;
			e.preventDefault();
			e.stopPropagation();
			(Remote.Menu.buildFromTemplate([{
				label: 'Save to Disk',
				click: _t.saveToDisk
			}])).popup(Remote.getCurrentWindow());
			return true;
		},
		saveToDisk: function() {
			var _t = this;
			IPCRenderer.send(
				'chat.saveDialog',
				thisChat.window.state.to,
				_t.props.file.name,
				_t.props.file.url
			);
			this.setState({saved: true});
		},
		render: function() {
			var className = 'chatMedia';
			var renderer = 'img';
			var blobType = 'image/*';
			var loadingExt = 'gif';
			if (this.props.file.type === 'recording') {
				renderer = 'video';
				blobType = 'video/*';
				loadingExt = 'webm';
			}
			var src = `../img/animations/loading.${loadingExt}`;
			if (
				(this.props.file.type === 'recording') &&
				(
					/^(aac)|(m4a)|(mp3)|(ogg)|(wav)$/
				).test(this.props.file.ext) &&
				this.state.ready
			) {
				renderer = 'audio';
				blobType = 'audio/*';
			}
			if (this.state.binary.length) {
				src = URL.createObjectURL(
					new Blob([this.state.binary], {
						type: blobType
					})
				);
			}
			return React.createElement('div', {
				className: 'chatMedia',
				'data-alignment': this.props.alignment,
				'data-offline': this.props.offline,
				key: 0
			}, React.createElement('span', {
				className: 'chatMediaInfo',
				key: 1
			}, React.createElement('span', {
				className: 'chatMediaSender',
				key: 2
			}, this.props.sender),
			React.createElement('span', {
				className: 'chatMediaDeviceName',
				'data-visible': !!this.props.deviceName.length,
				key: 3
			}, '(' + this.props.deviceName + ')'),
			React.createElement('span', {
				className: 'chatMediaTimestamp',
				key: 4
			}, this.props.timestamp)),
			React.createElement(renderer, {
				className: 'chatMediaRenderer',
				src: src,
				alt: '',
				'data-ready': this.state.ready,
				autoPlay: !this.state.ready,
				controls: this.state.ready,
				loop: !this.state.ready,
				onContextMenu: this.onContextMenu,
				key: 5
			}));
		}
	});

	var chatFileDragOverlay = React.createClass({
		displayName: 'chatFileDragOverlay',
		getInitialState: function() {
			return {
				visible: false
			};
		},
		componentDidMount: function() {
			return true;
		},
		onDrop: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.setState({visible: false});
			var readFile = function(path) {
				var name = Path.basename(path);
				FS.readFile(path, function(err, file) {
					if (err) { return false; }
					thisChat.window.sendFile(name, file);
				});
			};
			if (e.isTrusted) {
				var files = e.dataTransfer.files;
				var paths = [];
				var i = '';
				Object.keys(files).forEach((i) => {
					paths.push(files[i].path);
				});
				Object.keys(paths).forEach((i) => {
					readFile(paths[i]);
				});
			}
			return false;
		},
		render: function() {
			return React.createElement('div', {
				id: 'chatFileDragOverlay',
				'data-visible': this.state.visible,
				onDrop: this.onDrop,
				key: 0
			}, React.createElement('img', {
				src: '../img/files/image.png',
				alt: '',
				key: 1
			}),
			React.createElement('h2', {
				key: 2
			}, 'Drop File to Send.'),
			React.createElement('p', {
				key: 3
			},
			'Your file will be encrypted and sent over Cryptocat.'));
		}
	});

	var chatWindow = React.createClass({
		displayName: 'chatWindow',
		getInitialState: function() {
			return {
				recordVisible: false,
				connected: true,
				status: -1,
				key: 0,
				unread: 0,
				recordTime: 0,
				recordCountdown: 3,
				fontSize: 12,
				chatInputText: '',
				myChatState: 'paused',
				theirChatState: 'paused',
				to: '',
				recordSrc: '',
				myDeviceName: '',
				conversation: [],
				recordTimer: {}
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentDidUpdate: function() {
		},
		onChatInputTextChange: function(e) {
			this.setState({chatInputText: e.target.value});
		},
		onSubmit: function() {
			var message = this.state.chatInputText;
			if (!message.length) { return false; }
			this.setState({chatInputText: ''});
			thisChat.sendQueue.messages.push(message);
			if (!thisChat.sendQueue.isOn) {
				thisChat.sendQueue.turnOn();
			}
			this.updateConversation(true, {
				plaintext: message,
				valid: true,
				stamp: (new Date()).toString(),
				offline: (this.state.status !== 2),
				deviceName: this.state.myDeviceName
			});
			return false;
		},
		onContextMenu: function(e) {
			e.preventDefault();
			(Remote.Menu.buildFromTemplate([
				{
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
				}
			])).popup(Remote.getCurrentWindow());
			return true;
		},
		files: {},
		updateConversation: function(fromMe, info) {
			var _t = this;
			var sender = this.state.to;
			var alignment = (function() {
				if (fromMe) {
					sender = Cryptocat.Me.username;
					return 'right';
				}
				return 'left';
			})();
			var res = {};
			var sticker = checkIfSticker(info.plaintext);
			var file = checkIfFile(info.plaintext);
			if (sticker.isSticker) {
				res = React.createElement(chatSticker, {
					key: this.state.key,
					alignment: alignment,
					sticker: sticker.sticker
				});
			} else if (
				file.isFile &&
				(/^(image)|(recording)$/).test(file.file.type)
			) {
				res = React.createElement(chatMedia, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					timestamp: getTimestamp(info.stamp),
					file: file.file,
					offline: info.offline,
					deviceName: info.deviceName,
					ref: function(f) {
						_t.files[file.file.url] = f;
						if (!fromMe) {
							_t.receiveFile(file.file);
						}
					}
				});
			} else if (file.isFile) {
				res = React.createElement(chatFile, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					timestamp: getTimestamp(info.stamp),
					file: file.file,
					offline: info.offline,
					deviceName: info.deviceName,
					ref: function(f) {
						_t.files[file.file.url] = f;
						if (!fromMe) {
							_t.receiveFile(file.file);
						}
					}
				});
			} else {
				res = React.createElement(chatMessage, {
					key: this.state.key,
					sender: sender,
					alignment: alignment,
					message: info.plaintext,
					timestamp: getTimestamp(info.stamp),
					valid: info.valid,
					offline: info.offline,
					deviceName: info.deviceName
				});
			}
			this.setState({
				conversation: this.state.conversation.concat([
					res
				]),
				key: this.state.key + 1
			}, function() {
				var tCc = thisChat.contents;
				if (
					fromMe || ((
						tCc().scrollHeight - tCc().scrollTop
					) < 1000)
				) {
					tCc().scrollTop = tCc().scrollHeight;
					setTimeout(function() {
						tCc().scrollTop = tCc().scrollHeight;
					}, 100);
				}
			});
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
				offline: (this.state.status !== 2),
				deviceName: this.state.myDeviceName
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
								var rTP1 = thisChat.window
									.state.recordTime + 1;
								thisChat.window.setState({
									recordTime: rTP1
								});
							}, 1000)
						});
					}, 4000);
				});
			} else {
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
				_t.sendFile('video.webm', video);
			});
		},
		sendFileDialog: function(e) {
			document.getElementById('chatInputText').focus();
			IPCRenderer.send(
				'chat.openDialog',
				thisChat.window.state.to
			);
		},
		sendFile: function(name, file) {
			var _t = this;
			Cryptocat.File.send(name, file, function(info) {
				if (!info.valid) {
					return false;
				}
				var sendInfo = 'CryptocatFile:' + JSON.stringify(info);
				_t.updateConversation(true, {
					plaintext: sendInfo,
					valid: true,
					stamp: (new Date()).toString(),
					offline: (_t.state.status !== 2),
					deviceName: _t.state.myDeviceName
				});
			}, function(url, p) {
				_t.files[url].setState({progress: p});
				Remote.getCurrentWindow().setProgressBar(p / 100);
			}, function(info, file) {
				var sendInfo = 'CryptocatFile:' + JSON.stringify(info);
				Remote.getCurrentWindow().setProgressBar(-1);
				if (info.valid) {
					thisChat.sendQueue.messages.push(sendInfo);
					if (!thisChat.sendQueue.isOn) {
						thisChat.sendQueue.turnOn();
					}
				} else {
					Cryptocat.Diag.error.fileGeneral(info.name);
					return false;
				}
				_t.files[info.url].setState({
					progress: 100,
					ready: true,
					valid: info.valid,
					binary: file
				});
			});
		},
		receiveFile: function(file) {
			var _t = this;
			Cryptocat.File.receive(file, function(url, p) {
				_t.files[url].setState({progress: p});
				Remote.getCurrentWindow().setProgressBar(p / 100);
			}, function(url, plaintext, valid) {
				_t.files[url].setState({
					binary: plaintext,
					progress: 100,
					ready: valid,
					valid: valid
				});
				Remote.getCurrentWindow().setProgressBar(-1);
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
				fontSize: 12
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
					'data-status': (function() {
						if (!_t.state.connected) {
							return 0;
						}
						return _t.state.status;
					})(),
					'data-theirchatstate': this.state.theirChatState
				}, (function() {
					if (_t.state.theirChatState === 'composing') {
						return _t.state.to + ' is typing...';
					}
					if (!_t.state.connected) {
						return 'You are not currently connected to Cryptocat.';
					}
					return _t.state.to + _t.statusMessages[_t.state.status];
				})())),
				React.createElement('div', {
					key: 2,
					id: 'chatContents',
					onContextMenu: this.onContextMenu,
					style: {
						fontSize: this.state.fontSize + 'px'
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
					'data-sticker': 'content',
					onClick: this.sendSticker,
					title: 'Content',
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
					'data-sticker': 'challengeAccepted',
					onClick: this.sendSticker,
					title: 'Challenge Accepted!',
					key: 10
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'angry',
					onClick: this.sendSticker,
					title: 'Angry',
					key: 11
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'confused',
					onClick: this.sendSticker,
					title: 'Confused',
					key: 12
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'crying',
					onClick: this.sendSticker,
					title: 'Crying',
					key: 13
				}), React.createElement('div', {
					className: 'recordModal',
					'data-visible': this.state.recordVisible,
					key: 14
				}, React.createElement('div', {
					className: 'recordModalCountdown',
					'data-visible': !!this.state.recordCountdown,
					key: 15
				}, this.state.recordCountdown),
				React.createElement('video', {
					className: 'recordModalVideo',
					controls: false,
					src: this.state.recordSrc,
					autoPlay: true,
					muted: true,
					key: 16
				}), React.createElement('div', {
					className: 'recordModalControls',
					key: 17
				}, React.createElement('input', {
					type: 'button',
					className: 'recordModalSend',
					onClick: this.sendRecording,
					key: 18
				}), React.createElement('input', {
					type: 'button',
					className: 'recordModalCancel',
					onClick: this.record,
					key: 19
				}), React.createElement('div', {
					className: 'recordModalDuration',
					key: 20
				}, React.createElement('div', {
					className: 'recordModalDurationIndicator',
					'data-blinking': (this.state.recordTime >= 50),
					style: {
						width: ((this.state.recordTime * 100) / 60) + '%'
					},
					key: 21
				})))), React.createElement('input', {
					type: 'button',
					className: 'recordButton',
					onClick: this.record,
					title: 'Record Audio/Video',
					'data-active': this.state.recordVisible,
					key: 22
				}), React.createElement('input', {
					type: 'button',
					className: 'sendFileButton',
					onClick: this.sendFileDialog,
					title: 'Send File',
					key: 23
				})), React.createElement('textarea', {
					id: 'chatInputText',
					style: {
						fontSize: this.state.fontSize + 'px'
					},
					autoFocus: true,
					form: 'chatInput',
					placeholder: 'Type in your message...',
					onChange: this.onChatInputTextChange,
					onContextMenu: this.onContextMenu,
					disabled: (
						!this.state.status ||
						!this.state.connected
					),
					'data-enabled': (
						this.state.status &&
						this.state.connected
					),
					value: this.state.chatInputText,
					key: 24
				})))
			]);
		}
	});

	var thisChat = {
		window: ReactDOM.render(
			React.createElement(chatWindow, null),
			document.getElementById('renderA')
		),
		chatFileDragOverlay: ReactDOM.render(
			React.createElement(chatFileDragOverlay, null),
			document.getElementById('renderB')
		),
		contents: function() {
			return document.getElementById('chatContents');
		},
		chatFileDragOverlayCounter: 0,
		focused: true,
		theirComposingTimer: {},
		myComposingTimer: {},
		sendQueue: {
			messages: [],
			monitor: {},
			isOn: false,
			lastRecv: 0,
			turnOn: function() {
				thisChat.sendQueue.monitor = setInterval(function() {
					if (!thisChat.sendQueue.messages.length) {
						thisChat.sendQueue.turnOff();
						return false;
					}
					if ((Date.now() - thisChat.sendQueue.lastRecv) < 100) {
						return false;
					}
					IPCRenderer.sendSync(
						'chat.sendMessage',
						thisChat.window.state.to,
						thisChat.sendQueue.messages[0]
					);
					thisChat.sendQueue.messages.splice(0, 1);
				}, 100);
				thisChat.sendQueue.isOn = true;
			},
			turnOff: function() {
				clearInterval(thisChat.sendQueue.monitor);
				thisChat.sendQueue.isOn = false;
			}
		}
	};

	IPCRenderer.on('chat.connected', function(e, connected) {
		thisChat.window.setState({connected: connected});
	});

	IPCRenderer.on('chat.decreaseFontSize', function(e) {
		thisChat.window.decreaseFontSize();
	});

	IPCRenderer.on('chat.increaseFontSize', function(e) {
		thisChat.window.increaseFontSize();
	});

	IPCRenderer.once('chat.init', function(e, data) {
		Cryptocat.Me.username = data.myUsername;
		thisChat.window.setState({
			status: data.status,
			to: data.theirUsername,
			connected: data.connected,
			myDeviceName: data.myDeviceName
		});
		document.getElementById('chatInputText').focus();
	});

	IPCRenderer.on('chat.openDialog', function(e, paths) {
		var readFile = function(path) {
			var name = Path.basename(path);
			FS.readFile(path, function(err, file) {
				if (err) { return false; }
				thisChat.window.sendFile(name, file);
			});
		};
		Object.keys(paths).forEach((i) => {
			readFile(paths[i]);
		});
	});

	IPCRenderer.on('chat.receiveMessage', function(e, info) {
		thisChat.window.updateConversation(false, info);
		thisChat.sendQueue.lastRecv = (new Date(info.stamp)).getTime();
		if (!thisChat.focused) {
			Remote.getCurrentWindow().flashFrame(true);
			if (proc.platform === 'darwin') {
				thisChat.window.setState({
					unread: thisChat.window.state.unread + 1
				});
				var badgeCount = parseInt(Remote.app.dock.getBadge());
				if (Number.isNaN(badgeCount)) { badgeCount = 0; }
				Remote.app.dock.setBadge((badgeCount + 1).toString());
			}
		}
	});

	IPCRenderer.on('chat.record', function(e) {
		thisChat.window.record();
	});

	IPCRenderer.on('chat.resetFontSize', function(e) {
		thisChat.window.resetFontSize();
	});

	IPCRenderer.on('chat.saveDialog', function(e, path, url) {
		FS.writeFile(
			path,
			thisChat.window.files[url].state.binary,
			function() {}
		);
	});

	IPCRenderer.on('chat.sendFile', function(e) {
		thisChat.window.sendFileDialog();
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
			}, 20000);
		}
	});

	IPCRenderer.on('chat.viewDevices', function(e) {
		IPCRenderer.send(
			'deviceManager.create',
			thisChat.window.state.to
		);
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

	document.addEventListener('dragenter', function(e) {
		e.preventDefault();
		e.stopPropagation();
		thisChat.chatFileDragOverlayCounter += 1;
		thisChat.chatFileDragOverlay.setState({visible: true});
		return false;
	}, false);

	document.addEventListener('dragleave', function(e) {
		e.preventDefault();
		e.stopPropagation();
		thisChat.chatFileDragOverlayCounter -= 1;
		if (thisChat.chatFileDragOverlayCounter <= 0) {
			thisChat.chatFileDragOverlay.setState({visible: false});
		}
		return false;
	}, false);

	window.addEventListener('focus', function(e) {
		var unread = thisChat.window.state.unread;
		thisChat.window.state.unread = 0;
		thisChat.focused = true;
		Remote.getCurrentWindow().flashFrame(false);
		document.getElementById('chatInputText').focus();
		if (proc.platform === 'darwin') {
			var badgeCount = parseInt(Remote.app.dock.getBadge());
			if (Number.isNaN(badgeCount)) { badgeCount = 0; }
			badgeCount = badgeCount - unread;
			if (badgeCount <= 0) { badgeCount = ''; }
			Remote.app.dock.setBadge(badgeCount.toString());
		}
	});

	window.addEventListener('blur', function(e) {
		thisChat.focused = false;
	});

	window.addEventListener('resize', function(e) {
		thisChat.contents().style.height = (window.innerHeight - 135) + 'px';
	}); window.dispatchEvent(new Event('resize'));

	window.addEventListener('beforeunload', function(e) {
		var unread = thisChat.window.state.unread;
		var unsavedFilesDiag = function() {
			Cryptocat.Diag.message.unsavedFiles(function(response) {
				if (response === 1) {
					Remote.getCurrentWindow().destroy();
				}
			});
		};
		var unsentFilesDiag = function() {
			Cryptocat.Diag.message.unsentFiles(function(response) {
				if (response === 1) {
					Remote.getCurrentWindow().destroy();
				}
			});
		};
		thisChat.window.state.unread = 0;
		if (proc.platform === 'darwin') {
			var badgeCount = parseInt(Remote.app.dock.getBadge());
			if (Number.isNaN(badgeCount)) { badgeCount = 0; }
			badgeCount = badgeCount - unread;
			if (badgeCount <= 0) { badgeCount = ''; }
			Remote.app.dock.setBadge(badgeCount.toString());
		}
		Object.keys(thisChat.window.files).forEach((file) => {
			if (e.returnValue === 'false') {
				return false;
			}
			if (
				(thisChat.window.files[file].props.sender !== Cryptocat.Me.username) &&
				!thisChat.window.files[file].state.saved
			) {
				e.returnValue = 'false';
				unsavedFilesDiag();
			} else if (
				hasProperty(thisChat.window.files, file) &&
				(thisChat.window.files[file].props.sender === Cryptocat.Me.username) &&
				(thisChat.window.files[file].state.progress < 100)
			) {
				e.returnValue = 'false';
				unsentFilesDiag();
			}
		});
		if (thisChat.sendQueue.messages.length) {
			Cryptocat.Diag.error.messagesQueued(
				thisChat.sendQueue.messages.length
			);
			e.returnValue = 'false';
		}
	});
});

