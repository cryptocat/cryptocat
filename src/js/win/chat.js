window.addEventListener('load', function(e) {
	'use strict';

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
			}
		},
		componentDidMount: function() {
			return true;
		},
		onClick: function() {
			if (
				(this.state.progress < 100) ||
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
					FS.writeFile(path, _t.state.binary);
				}
			);
		},
		render: function() {
			return React.createElement('div', {
				className: 'chatFile',
				'data-alignment': this.props.alignment,
				key: 0
			}, React.createElement('img', {
				className: 'chatFileIcon',
				src: '../img/files/' + this.props.file.type + '.png',
				onClick: this.onClick,
				key: 1
			}), React.createElement('div', {
				className: 'chatFileProgressBar',
				key: 2
			}, React.createElement('div', {
				className: 'chatFileProgressBarIndicator',
				'data-valid': this.state.valid,
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
			if (!this.props.valid) {
				className += ' chatMessageError';
			}
			else if (this.props.offline) {
				className += ' chatMessageOffline';
			}
			return React.createElement('div', {
				className: className,
				'data-alignment': this.props.alignment,
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

	var chatWindow = React.createClass({
		displayName: 'chatWindow',
		getInitialState: function() {
			return {
				chatInputText: '',
				conversation: [],
				key: 0,
				status: -1,
				myChatState: 'paused',
				theirChatState: 'paused',
				to: '',
				unread: 0
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
		updateConversation: function(fromMe, info) {
			var _t        = this;
			var sender    = this.state.to;
			var alignment = 'left';
			if (fromMe) {
				sender    = Cryptocat.Me.username;
				alignment = 'right';
			}
			var sticker = checkIfSticker(info.plaintext);
			var file    = checkIfFile(info.plaintext);
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
					ref: function(f) {
						_t.files[file.file.url] = f;
						if (!fromMe) {
							_t.receiveFile(file.file);
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
		sendFile: function(e) {
			var _t = this;
			var sendFile = function(path) {
				Cryptocat.File.send(path[0], function(info) {
					var sendInfo = 'CryptocatFile:' + JSON.stringify(info);
					if (!info.valid) {
						return false;
					}
					_t.updateConversation(true, {
						plaintext: sendInfo,
						valid: true,
						stamp: (new Date()).toString(),
						offline: (_t.state.status !== 2)
					});
				}, function(url, p) {
					_t.files[url].setState({progress: p});
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
						valid: info.valid,
						binary: file
					});
				});
			};
			document.getElementById('chatInputText').focus();
			Cryptocat.Diag.open.sendFile(
				Remote.getCurrentWindow(), function(path) {
					if (!path) {
						return false;
					}
					sendFile(path);
				}
			);
		},
		receiveFile: function(file) {
			var _t = this;
			Cryptocat.File.receive(file, function(url, p) {
				_t.files[url].setState({progress: p});
			}, function(url, plaintext, valid) {
				if (!valid) {
					Cryptocat.Diag.error.fileSave();
				}
				_t.files[url].setState({
					binary: plaintext,
					progress: 100,
					valid: valid
				});
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
					id: 'chatContents'
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
					'data-sticker': 'angry',
					onClick: this.sendSticker,
					title: 'Angry',
					key: 12
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'challengeAccepted',
					onClick: this.sendSticker,
					title: 'Challenge Accepted!',
					key: 13
				}), React.createElement('input', {
					type: 'button',
					className: 'sendFileButton',
					onClick: this.sendFile,
					title: 'Send File',
					key: 14
				})
				), React.createElement('textarea', {
					key: 15,
					id: 'chatInputText',
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
					if ((Date.now() - thisChat.sendQueue.lastRecv) < 4000) {
						return false;
					}
					IPCRenderer.sendSync(
						'chat.sendMessage',
						thisChat.window.state.to,
						thisChat.sendQueue.messages[0]
					);
					thisChat.sendQueue.messages.splice(0, 1);
				}, 2000);
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

	IPCRenderer.on('chat.sendFile', function(e) {
		thisChat.window.sendFile();
	});
	
	Mousetrap(
		document.getElementById('chatInputText')
	).bind('enter', function(e, combo) {
		e.preventDefault();
		thisChat.window.onSubmit();
	});

	('1234567890qwertyuiopasdfghjklzxcvbnm'.split('')).forEach(function(k) {
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
		thisChat.contents().style.height = (window.innerHeight - 140) + 'px';
	}); window.dispatchEvent(new Event('resize'));

	window.addEventListener('beforeunload', function(e) {
		if (thisChat.sendQueue.messages.length) {
			Cryptocat.Diag.error.messagesQueued(
				thisChat.sendQueue.messages.length
			);
			e.returnValue = 'false';
			return false;
		}
	});

});

document.addEventListener('dragover', function(e) {
	e.preventDefault();
	return false;
}, false);

document.addEventListener('drop', function(e) {
	e.preventDefault();
	return false;
}, false);

