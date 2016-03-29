'use strict';

var getOS = function() {
	if ((/Win/).test(navigator.platform)) {
		return 'win32'
	}
	if ((/Mac/).test(navigator.platform)) {
		return 'darwin'
	}
	return 'linux'
};
