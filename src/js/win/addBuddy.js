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

	var addBuddy = React.createClass({
		displayName: 'addBuddy',
		getInitialState: function() {
			return {
				username: '',
				disabled: false
			};
		},
		componentDidMount: function() {
			return true;
		},
		onChangeUsername: function(e) {
			this.setState({username: e.target.value.toLowerCase()});
		},
		onSubmit: function(e) {
			var _t = this;
			this.setState({disabled: true});
			if (this.validInputs()) {
				IPCRenderer.sendSync(
					'addBuddy.sendRequest', this.state.username
				);
				setInterval(function() {
					Remote.getCurrentWindow().close();
				}, 250);
			} else {
				Cryptocat.Diag.error.addBuddyValidation();
				this.onError();
			}
			e.preventDefault();
			return false;
		},
		validInputs: function() {
			return Cryptocat.Patterns.username.test(
				this.state.username
			);
		},
		onSuccess: function() {
		},
		onError: function() {
			this.setState({disabled: false});
		},
		render: function() {
			return React.createElement('form', {
				className: 'addBuddy',
				onSubmit: this.onSubmit
			}, [
				React.createElement('img', {
					key: 0,
					src: '../img/logo/logo.png',
					alt: 'Cryptocat',
					className: 'logo',
					draggable: 'false'
				}),
				React.createElement('span', {
					key: 1
				}, 'Enter a Cryptocat username to send a buddy request.'),
				React.createElement('input', {
					key: 2,
					type: 'text',
					placeholder: 'Username',
					value: this.state.username,
					onChange: this.onChangeUsername,
					autoFocus: true,
					maxLength: 16
				}),
				React.createElement('input', {
					key: 3,
					type: 'submit',
					value: 'Send Buddy Request',
					disabled: this.state.disabled
				})
			]);
		}
	});

	var thisAddBuddy = ReactDOM.render(
		React.createElement(addBuddy, null),
		document.getElementById('renderA')
	);
});

