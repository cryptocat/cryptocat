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

	var device = React.createClass({
		displayName: 'device',
		getInitialState: function() {
			var _t = this;
			return {
				trusted: _t.props.trusted
			};
		},
		componentDidMount: function() {
			return true;
		},
		onRemoveDevice: function() {
			IPCRenderer.sendSync(
				'deviceManager.removeDevice',
				this.props.deviceId
			);
		},
		onChangeTrustedCheckbox: function(e) {
			var checked = e.target.checked;
			this.setState({
				trusted: checked
			}, function() {
				IPCRenderer.sendSync(
					'deviceManager.setTrusted',
					this.props.username,
					this.props.deviceId,
					checked
				);
			});
		},
		render: function() {
			return React.createElement('div', {
				key: 0,
				className: 'device'
			}, React.createElement('div', {
				key: 1,
				className: 'deviceIcon',
				'data-icon': this.props.deviceIcon
			}), React.createElement('h2', {
				key: 2,
				className: 'deviceName'
			}, this.props.deviceName),
			React.createElement('input', {
				key: 3,
				className: 'removeDevice',
				type: 'button',
				value: 'Remove',
				'data-visible': this.props.mine,
				onClick: this.onRemoveDevice
			}),
			React.createElement('label', {
				key: 4,
				className: 'deviceTrusted',
				'data-visible': !this.props.mine
			},
			React.createElement('input', {
				key: 5,
				className: 'deviceTrustedCheckbox',
				type: 'checkbox',
				checked: this.state.trusted,
				onChange: this.onChangeTrustedCheckbox
			}),
			React.createElement('span', {
				key: 6,
				className: 'deviceTrustedText'
			}, 'Trusted Device')),
			React.createElement('p', {
				key: 7,
				className: 'deviceFingerprint'
			}, this.props.deviceFingerprint));
		}
	});

	var deviceManager = React.createClass({
		displayName: 'deviceManager',
		getInitialState: function() {
			return {
				devices: [],
				username: '',
				mine: false,
				trustedOnly: false
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentDidUpdate: function() {
		},
		onChangeTrustedOnlyCheckbox: function(e) {
			var checked = e.target.checked;
			this.setState({
				trustedOnly: checked
			}, function() {
				IPCRenderer.sendSync(
					'deviceManager.setTrustedOnly',
					this.state.username,
					checked
				);
			});
		},
		render: function() {
			return React.createElement('div', {
				className: 'deviceManager'
			}, [
				React.createElement('div', {
					key: 0,
					id: 'deviceManagerTop'
				},
				React.createElement('h2', {
					key: 1
				}, this.state.username + '\'s devices'),
				React.createElement('label', {
					key: 2,
					className: 'deviceManagerTrustedOnly',
					'data-visible': !this.state.mine
				},
				React.createElement('input', {
					key: 3,
					className: 'deviceManagerTrustedOnlyCheckbox',
					type: 'checkbox',
					checked: this.state.trustedOnly,
					onChange: this.onChangeTrustedOnlyCheckbox
				}),
				React.createElement('span', {
					key: 4,
					className: 'deviceManagerTrustedOnlyText'
				}, 'Send my messages only to trusted devices.'))),
				React.createElement('div', {
					key: 2,
					id: 'deviceManagerContents'
				}, this.state.devices),
				React.createElement('div', {
					key: 3,
					id: 'deviceManagerBottom'
				})
			]);
		}
	});

	var thisDeviceManager = {
		window: ReactDOM.render(
			React.createElement(deviceManager, null),
			document.getElementById('renderA')
		)
	};

	IPCRenderer.on('deviceManager.update', function(e, data) {
		var devices = [];
		data.devices.forEach(function(d) {
			devices.push(React.createElement(device, {
				username: data.username,
				deviceId: d.deviceId,
				deviceName: d.deviceName,
				deviceIcon: d.deviceIcon,
				deviceFingerprint: d.deviceFingerprint,
				key: d.deviceFingerprint,
				mine: data.mine,
				trusted: d.trusted
			}));
		});
		thisDeviceManager.window.setState({
			username: data.username,
			devices: devices,
			mine: data.mine,
			trustedOnly: data.trustedOnly
		});
	});
});

