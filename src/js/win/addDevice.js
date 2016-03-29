window.addEventListener('load', function(e) {
	'use strict';

	var addDevice = React.createClass({
		displayName: 'addDevice',
		getInitialState: function() {
			return {
				icon: 0,
				name: ''
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentDidUpdate: function() {	
		},
		onChangeName: function (e) {
			this.setState({name: e.target.value});
		},
		onSubmit: function(e) {
			if (this.validInputs()) {
				IPCRenderer.send(
					'addDevice.addDevice',
					this.state.name,
					this.state.icon
				);
				window.close();
			}
			else {
				Cryptocat.Diag.error.addDeviceValidation();
			}
			e.preventDefault();
			return false;
		},
		validInputs: function() {
			return Cryptocat.Patterns.deviceName.test(
				this.state.name
			);
		},
		deviceIconSelect: function(e) {
			var icon  = e.target;
			var icons = document.getElementsByClassName('deviceIcon');
			this.setState({
				icon: parseInt(e.target.getAttribute('data-icon'))
			});
			for (var i = 0; i < 3; i++) {
				icons[i].setAttribute('data-selected', 'false');
			};
			icon.setAttribute('data-selected', 'true');
		},
		render: function() {
			return React.createElement('form', {
				className: 'addDevice',
				onSubmit: this.onSubmit
			}, [
				React.createElement('div', {
					key: 0,
					id: 'addDeviceIconPicker'
				}, [
					React.createElement('div', {
						key: 1,
						className: 'deviceIcon',
						'data-icon': '0',
						'data-selected': 'true',
						onClick: this.deviceIconSelect
					}),
					React.createElement('div', {
						key: 2,
						className: 'deviceIcon',
						'data-icon': '1',
						'data-selected': 'false',
						onClick: this.deviceIconSelect
					}),
					React.createElement('div', {
						key: 3,
						className: 'deviceIcon',
						'data-icon': '2',
						'data-selected': 'false',
						onClick: this.deviceIconSelect
					})
				]),
				React.createElement('h2', {
					key: 4,
					className: 'addDeviceHeader',
				}, 'Add Device'),
				React.createElement('p', {
					key: 5,
					className: 'addDeviceDescription'
				}, 'Choose an icon and a name for your new device. ' +
					'Make it count: you will not be able to modify them later.'),
				React.createElement('input', {
					key: 6,
					type: 'text',
					id: 'addDeviceName',
					placeholder: 'Name your device',
					value: this.state.name,
					onChange: this.onChangeName,
					autoFocus: true,
					maxLength: 24
				}),
				React.createElement('input', {
					key: 7,
					value: 'Add Device',
					type: 'submit'
				})
			]);
		}
	});

	var thisAddDevice = {
		window: ReactDOM.render(
			React.createElement(addDevice, null),
			document.getElementById('addDevice')
		)
	};
});

document.addEventListener('dragover', function(e) {
	e.preventDefault();
	return false;
}, false);

document.addEventListener('drop', function(e) {
	e.preventDefault();
	return false;
}, false);

