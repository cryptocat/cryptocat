'use strict';

window.addEventListener('load', function(e) {
	Remote.getCurrentWindow().setMenu(Remote.Menu.buildFromTemplate(
		[{
			label: 'Window',
			submenu: [{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				click: function() {
					Remote.getCurrentWindow().close();
				}
			}]
		}]
	));

	var setAvatar = React.createClass({
		displayName: 'setAvatar',
		getInitialState: function() {
			return {
				username: '',
				currentAvatar: 'xx'
			};
		},
		componentDidMount: function() {
			return true;
		},
		setCurrentAvatar: function(avatar) {
			this.setState({
				currentAvatar: avatar
			});
		},
		onSubmit: function(e) {
			IPCRenderer.sendSync(
				'setAvatar.setAvatar',
				this.state.currentAvatar
			);
			setInterval(function() {
				Remote.getCurrentWindow().close();
			}, 250);
			e.preventDefault();
			return false;
		},
		render: function() {
			var _t = this;
			var avatars = [];
			var avatarOnClick = function(e) {
				_t.setCurrentAvatar(
					e.target.getAttribute('data-avatar')
				);
			};
			for (var a = 0; a <= 38; a += 1) {
				var av = a.toString();
				if (av.length < 2) { av = '0' + av; }
				avatars.push(
					React.createElement('img', {
						key: `a${av}`,
						src: `../img/avatars/${av}.png`,
						alt: '',
						'data-avatar': av,
						onClick: avatarOnClick,
						className: 'setAvatarAvatar',
						draggable: false
					})
				);
			}
			return React.createElement('form', {
				className: 'setAvatar',
				onSubmit: this.onSubmit
			}, [
				React.createElement('div', {
					key: 0,
					className: 'setAvatarUserInfo'
				}, [
					React.createElement('img', {
						key: 1,
						src: `../img/avatars/${_t.state.currentAvatar}.png`,
						alt: 'Current Avatar',
						className: 'setAvatarUserInfoCurrentAvatar',
						draggable: false
					}),
					React.createElement('span', {
						key: 2,
						className: 'setAvatarUserInfoUsername'
					}, this.state.username),
					React.createElement('span', {
						key: 3,
						className: 'setAvatarUserInfoStatusText'
					}, 'Online')
				]),
				React.createElement('div', {
					key: 4,
					className: 'setAvatarAvatarSelection'
				}, avatars),
				React.createElement('input', {
					key: 5,
					type: 'submit',
					value: 'Set Avatar'
				})
			]);
		}
	});

	var thisSetAvatar = ReactDOM.render(
		React.createElement(setAvatar),
		document.getElementById('renderA')
	);

	IPCRenderer.once('setAvatar.init', function(e, data) {
		thisSetAvatar.setState({
			username: data.username,
			currentAvatar: data.avatar
		});
	});

});

