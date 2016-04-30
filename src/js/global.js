'use strict';
const NodeCrypto    = require('crypto');
const IPCRenderer   = require('ipc-renderer');
const HTTPS         = require('https');
const FS            = require('fs');
const Remote        = require('remote');

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
	Recording: {}
};

Cryptocat.Me = Object.assign({}, Cryptocat.EmptyMe);

const hasProperty = function(o, p) {
	return ({}).hasOwnProperty.call(o, p);
};
