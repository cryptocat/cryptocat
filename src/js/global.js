(function() {
	'use strict';
	const NodeCrypto    = require('crypto');
	const IPCRenderer   = require('ipc-renderer');
	const HTTPS         = require('https');
	const Remote        = require('remote');
	const FS            = require('fs');
	const Dialog        = Remote.require('dialog');
	const Path          = (function() {
		if (process.platform === 'win32') {
			return (require('path')).win32;
		}
		return require('path');
	})();
	
	const Cryptocat = {
		Win: {},
		XMPP: {},
		TextSecure: {},
		EmptyMe: {
			username: '',
			connected: false,
			settings: {
				identityKey: {priv: [], pub: []},
				identityDHKey: [],
				deviceId: '',
				deviceName: '',
				deviceIcon: 0,
				deviceIds: [],
				signedPreKey: {priv: [], pub: []},
				signedPreKeyId: 0,
				signedPreKeySignature: '',
				preKeys: [],
				userBundles: {},
				sounds: true,
				notify: true,
				typing: true,
				status: 0,
				refresh: 0,
				directories: {
					fileSelect: '',
					fileSave: ''
				}
			}
		},
		Diag: {},
		Storage: {},
		Axolotl: {},
		OMEMO: {},
		Version: '',
		Update: {},
		Patterns: {},
		Pinning: {},
		Notify: {},
		File: {},
		Recording: {},
		Directories: {}
	};

	var _setImmediate = setImmediate;
	var _clearImmediate = clearImmediate;
	
	process.once('loaded', function() {
		global.Cryptocat = Cryptocat;
		Object.freeze(global.Cryptocat.EmptyMe);
		global.NodeCrypto = NodeCrypto;
		global.IPCRenderer = IPCRenderer;
		global.HTTPS = HTTPS;
		global.FS = FS;
		global.Dialog = Dialog;
		global.Path = Path;
		global.Remote = Remote;
		global.proc = {
			platform: process.platform
		};
		global.setImmediate = _setImmediate;
		global.clearImmediate = _clearImmediate;
		global.__gdirname = __dirname;
		global.Cryptocat.Me = Object.assign(
			{}, global.Cryptocat.EmptyMe
		);
		global.hasProperty = function(o, p) {
			return ({}).hasOwnProperty.call(o, p);
		};
	});
})();
