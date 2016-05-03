'use strict';

window.addEventListener('load', function(e) {	
var updateDownloader = React.createClass({
	displayName: 'updateDownloader',
	getInitialState: function() {
		return {
			progress: 0,
			progressBarIndicatorWidth: '0px',
			statusMessage: 'Downloading update...'
		};
	},
	componentDidMount: function() {
		return true;
	},
	onProgress: function(cur, len) {
		var p = Math.round((cur * 100) / len);
		var w = Math.round((p * 200) / 100);
		Remote.getCurrentWindow().setProgressBar(p / 100);
		this.setState({
			progress: p,
			progressBarIndicatorWidth: w + 'px'
		});
	},
	onSuccess: function() {
	},
	onError: function() {
	},
	render: function() {
		return React.createElement('div', {
			className: 'updateDownloader'
		}, [
			React.createElement('img', {
				key: 0,
				src: '../img/logo/logo.png',
				alt: 'Cryptocat',
				className: 'logo',
				draggable: 'false'
			}),
			React.createElement('span', {
				key: 1,
			}, this.state.statusMessage),
			React.createElement('div', {
				key: 2,
				className: 'updateProgressBar'
			}, React.createElement('div', {
				key: 3,
				className: 'updateProgressBarIndicator',
				style: {
					width: this.state.progressBarIndicatorWidth
				}
			}))
		]);
	}
});

var thisUpdateDownloader = ReactDOM.render(
	React.createElement(updateDownloader, null),
	document.getElementById('renderA')
);

var verifySignature = function(path, hash, callback) {
	var signature = '';
	HTTPS.get(Cryptocat.Update.sigURIs[process.platform], function(res) {
		res.on('data', function(chunk) {
			signature += chunk;
		});
		res.on('end', function() {
			signature = signature.replace(/(\r\n)|\n|\r/gm, '');
			var valid = ProScript.crypto.ED25519.checkValid(
				signature, hash, Cryptocat.Update.signingKey
			);
			callback(valid);
		});
	}).on('error', function(err) {
		Cryptocat.Diag.error.updateDownloader();
		FS.unlink(path);
		setInterval(function() {
			Remote.getCurrentWindow().close();
		}, 250);
	});
};

Cryptocat.Update.saveDialog(Remote.getCurrentWindow(), function(path) {
	if (!path) {
		setInterval(function() {
			Remote.getCurrentWindow().close();
		}, 250);
		return false;
	}
	var file = FS.createWriteStream(path);
	var cur  = 0;
	var hash = NodeCrypto.createHash('sha256');
	HTTPS.get(Cryptocat.Update.clientURIs[process.platform], function(res) {
		var len = parseInt(res.headers['content-length'], 10);
		res.pipe(file);
		res.on('data', function(chunk) {
			cur += chunk.length;
			hash.update(chunk, 'binary');
			thisUpdateDownloader.onProgress(cur, len);
		});
		file.on('finish', function() {
			file.close();
			Remote.getCurrentWindow().setProgressBar(-1);
			thisUpdateDownloader.setState({
				statusMessage: 'Verifying signature...'
			});
			verifySignature(path, hash.digest('hex'), function(valid) {
				if (valid) {
					Cryptocat.Diag.message.updateDownloaded(function() {
						IPCRenderer.sendSync('main.beforeQuit');
						setInterval(function() {
							Remote.getCurrentWindow().close();
						}, 250);
					});
				}
				else {
					Cryptocat.Diag.error.updateDownloader();
					FS.unlink(path);
					setInterval(function() {
						Remote.getCurrentWindow().close();
					}, 250);
				}
			});
		});
	}).on('error', function(err) {
		Cryptocat.Diag.error.updateDownloader();
		FS.unlink(path);
		setInterval(function() {
			Remote.getCurrentWindow().close();
		}, 250);
	});
});
});
