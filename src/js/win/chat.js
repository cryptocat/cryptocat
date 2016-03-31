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
				'angry', 'blushing', 'challengeAccepted',
				'confused', 'crying', 'embarrassed',
				'grinning', 'hurt', 'inLove', 'nerdy',
				'sarcastic', 'sick', 'sleepy', 'smiling',
				'winking'
			];
			var sticker = message.substr(17);
			if (stickers.indexOf(sticker) >= 0) {
				sticker = React.createElement('img', {
					className: 'chatMessageSticker',
					alt: '',
					src: '../img/stickers/' + sticker + '.png'
				});
				return {
					message: sticker,
					isSticker: true
				}
			}
		}
		return {
			message: message,
			isSticker: false
		}
	};

	var chatMessage = React.createClass({
		displayName: 'chatMessage',
		getInitialState: function() {
			return {};
		},
		componentDidMount: function() {
			return true;
		},
		onClick: function(e) {
			e.preventDefault();
			if (e.target.tagName === 'A') {
				Remote.shell.openExternal(
					e.target.getAttribute('href')
				);
			}
		},
		render: function() {
			var className = this.props.alignment;
			if (this.props.isSticker) {
				className += ' chatMessageSticker';
			}
			else if (!this.props.valid) {
				className += ' chatMessageError';
			}
			else if (this.props.offline) {
				className += ' chatMessageOffline';
			}
			return React.createElement('div', {
				className: className,
				onClick: this.onClick,
				key: 0,
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
				status: 0
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
			this.updateConversation(Cryptocat.Me.username, {
				plaintext: message,
				valid: true,
				stamp: (new Date()).toString(),
				offline: (this.state.status !== 2)
			});
			return false;
		},
		updateConversation: function(sender, info) {
			var alignment = 'chatMessageLeft';
			if (sender === Cryptocat.Me.username) {
				alignment = 'chatMessageRight';
			}
			var message = checkIfSticker(info.plaintext);
			this.setState({
				conversation: this.state.conversation.concat([
					React.createElement(chatMessage, {
						key:       this.state.key,
						sender:    sender,
						alignment: alignment,
						isSticker: message.isSticker,
						message:   message.message,
						timestamp: getTimestamp(info.stamp),
						valid:     info.valid,
						offline:   info.offline
					})
				]),
				key: this.state.key + 1
			}, function() {
				thisChat.contents().scrollTop = thisChat.contents().scrollHeight;
			})
		},
		sendSticker: function(e) {
			var sticker = 'CryptocatSticker:' + e.target.getAttribute('data-sticker');
			thisChat.sendQueue.messages.push(sticker);
			if (!thisChat.sendQueue.isOn) {
				thisChat.sendQueue.turnOn();
			}
			this.updateConversation(Cryptocat.Me.username, {
				plaintext: sticker,
				valid: true,
				stamp: (new Date()).toString(),
				offline: (this.state.status !== 2)
			});
		},
		statusMessages: [
			'You are currently unable to send offline messages to this buddy.',
			'Your buddy is offline but can receive messages.',
			'Your buddy is online.'
		],
		render: function() {
			return React.createElement('div', {}, [
				React.createElement('div', {
					key: 0,
					id: 'chatTop'
				}, React.createElement('div', {
					key: 1,
					className: 'chatTopStatus',
					'data-status': this.state.status
				}, this.statusMessages[this.state.status])),
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
					className: 'chatToolbarButton',
					'data-sticker': 'confused',
					onClick: this.sendSticker,
					title: 'Confused',
					key: 14
				}), React.createElement('input', {
					type: 'button',
					className: 'chatToolbarButton',
					'data-sticker': 'crying',
					onClick: this.sendSticker,
					title: 'Crying',
					key: 15
				})
				), React.createElement('textarea', {
					key: 12,
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
		unread: 0,
		sendQueue: {
			messages: [],
			monitor:  {},
			rate: 999,
			isOn: false,
			turnOn: function() {
				thisChat.sendQueue.monitor = setInterval(function() {
					if (!thisChat.sendQueue.messages.length) {
						thisChat.sendQueue.turnOff();
						return false;
					}
					IPCRenderer.sendSync(
						'chat.sendMessage',
						thisChat.to,
						thisChat.sendQueue.messages[0]
					);
					thisChat.sendQueue.messages.splice(0, 1);
				}, thisChat.sendQueue.rate);
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
		thisChat.to           = data.theirUsername;
		thisChat.window.setState({status: data.status});
		document.getElementById('chatInputText').focus();
	});

	IPCRenderer.on('chat.status', function(e, status) {
		thisChat.window.setState({status: status});
	});

	IPCRenderer.on('chat.receiveMessage', function(e, info) {
		thisChat.window.updateConversation(thisChat.to, info);
		if (!thisChat.focused && (process.platform === 'darwin')) {
			thisChat.unread++;
			var badgeCount = parseInt(Remote.app.dock.getBadge());
			if (isNaN(badgeCount)) { badgeCount = 0; }
			Remote.app.dock.setBadge((badgeCount + 1).toString());
			Remote.app.dock.bounce();
		}
	});
	
	Mousetrap(document.getElementById('chatInputText')).bind('enter', function(e, combo) {
		e.preventDefault();
		thisChat.window.onSubmit();
	});

	window.addEventListener('focus', function(e) {
		document.getElementById('chatInputText').focus();
		if (process.platform !== 'darwin') {
			return false;
		}
		var badgeCount = parseInt(Remote.app.dock.getBadge());
		if (isNaN(badgeCount)) { badgeCount = 0; }
		badgeCount = badgeCount - thisChat.unread;
		if (badgeCount <= 0) { badgeCount = ''; }
		Remote.app.dock.setBadge(badgeCount.toString());
		thisChat.unread  = 0;
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

