'use strict';

window.addEventListener('load', function(e) {	
	var changePassword = React.createClass({
		displayName: 'changePassword',
		getInitialState: function() {
			return {
				password: '',
				vassword: ''
			};
		},
		componentDidMount: function() {
			return true;
		},
		onChangePassword: function(e) {
			this.setState({password: e.target.value});
		},
		onChangeVassword: function(e) {
			this.setState({vassword: e.target.value});
		},
		onSubmit: function(e) {
			var _t = this;
			if (this.validInputs()) {
				IPCRenderer.sendSync(
					'changePassword.changePassword', this.state.password
				);
				setInterval(function() {
					Remote.getCurrentWindow().close();
				}, 250);
			}
			else {
				Cryptocat.Diag.error.changePasswordValidation();
			}
			e.preventDefault();
			return false;
		},
		validInputs: function() {
			return Cryptocat.Patterns.password.test(
				this.state.password
			) && (
				this.state.password === this.state.vassword
			);
		},
		render: function() {
			return React.createElement('form', {
				className: 'changePassword',
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
				}, 'Enter a new password for your Cryptocat account.'),
				React.createElement('input', {
					key: 2,
					type: 'password',
					placeholder: 'Password',
					value: this.state.password,
					onChange: this.onChangePassword,
					autoFocus: true,
					maxLength: 512
				}),
				React.createElement('input', {
					key: 3,
					type: 'password',
					placeholder: 'Verify Password',
					value: this.state.vassword,
					onChange: this.onChangeVassword,
					maxLength: 512
				}),
				React.createElement('input', {
					key: 4,
					type: 'submit',
					value: 'Change Password'
				})
			]);
		}
	});

	var thisChangePassword = ReactDOM.render(
		React.createElement(changePassword, null),
		document.getElementById('renderA')
	);

});

