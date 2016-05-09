'use strict';
Cryptocat.Pinning = {};

(function() {
	var domains = {
		'crypto.cat': {
			issuer: 'Gandi Standard SSL CA 2',
			subject: 'crypto.cat',
			exponent: '0x10001',
			modulus: (
				'C4B6B422A47FB1902A7436FA90AC7B17B4D88DB595CCBA5C3EF8FAE09D0EBB4D' +
				'44326F15A1DF9D45AF371560D805C3A16182E1133BFEB1E8943190A1161AD1D6' +
				'DBD1029513A6241CA8D964CB47A4EF502DE360683864387FADCB6A16CBD7D536' +
				'AD9B19CE109CB4C7CC54C94AFA142B652820824516CA88CEC215B44CC3EE37CE' +
				'84FE9849B4B8BFAF9406F4E79F45F932275481506A9FB31054ABE188C967C780' +
				'7AF099A97B3CE87F748EA0FA2A7305A99BE892EE1C2679816C4690AF75785702' +
				'3756D65ED0C7B1B8F1BEED47E77C184B061FD9F86A2C5925199E495CED7C955C' +
				'608C0BDCAB23185704B97892FBE19910C88CCCD510E13150648B6174BF309FD5'
			)
		},
		'download.crypto.cat': {
			issuer: 'Let\'s Encrypt Authority X3',
			subject: 'download.crypto.cat',
			exponent: '0x10001',
			modulus: (
				'BB34D8E4E4CC874EB84E61259788AC54CD7BEA3196E5C2872DA80F2FCFC4E6B6' +
				'56B169865C074EA4BB087FC9CD54C999B89B6099FAC925CF41354700C88A0837' +
				'3CB94E480F7867AAD93CF9466DDD36A44F03CE0B09CED64DC01AD07E10B91BBB' +
				'1CD17279A670FDD713154282AAA4BB60A05460A403AD00BBA480486824D5C95B' +
				'1701C67C7E783A3C3B1490D27AB9864AF338B74C40A291D0DD8A810E41CD5BCC' +
				'5C3A3D66770AB7DFD045BF7C7DB5B8A00B6D651E2EBEC13EBC6570F74E908DCD' +
				'A321627B415AF0A9740B516FC0F9AD919A2A9F8F0DAAB3E04FAC98E2994FCB36' +
				'058F8B48FF02670171D0F965760B2277C5A72B672C75038066C89A4F3628E657'
			)
		}
	};

	Cryptocat.Pinning.get = function(url, callback) {
		var domain = domains['crypto.cat'];
		if (url.startsWith('https://download.crypto.cat/')) {
			domain = domains['download.crypto.cat'];
		}
		var cert = {};
		var get = HTTPS.request({
			hostname: domain.subject,
			port: 443,
			protocol: 'https:',
			path: NodeUrl.parse(url).pathname,
			agent: false
		}, function(res) {
			if (
				(cert.issuer.CN === domain.issuer) &&
				(cert.subject.CN === domain.subject) &&
				(cert.exponent === domain.exponent) &&
				(cert.modulus === domain.modulus)
			) {
				callback(res, true);
			} else {
				callback({}, false);
			}
		});
		get.on('socket', (socket) => {
			socket.on('secureConnect', function() {
				cert = socket.getPeerCertificate();
			});
		});
		get.on('error', (e) => {
			callback({}, false);
		});
		get.end();
		return false;
	};
})();
