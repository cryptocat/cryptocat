'use strict';

window.addEventListener('load', function(e) {
	var device = React.createClass({
		displayName: 'device',
		getInitialState: function() {
			return {};
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
		render: function() {
			return React.createElement('div', {
				key: 0,
				className: 'device',
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
			React.createElement('p', {
				key: 4,
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
				mine: false
			};
		},
		componentDidMount: function() {
			return true;
		},
		componentDidUpdate: function() {	
		},
		render: function() {
			return React.createElement('div', {
				className: 'deviceManager'
			}, [
				React.createElement('div', {
					key: 0,
					id: 'deviceManagerTop'
				}, React.createElement('h2', {
					key: 1
				}, this.state.username + '\'s Devices')),
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
				mine: data.mine
			}));
		});
		thisDeviceManager.window.setState({
			username: data.username,
			devices: devices,
			mine: data.mine
		});
	});
});

