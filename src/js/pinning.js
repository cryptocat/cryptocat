Cryptocat.Pinning = {};

(function() {
'use strict';

var fingerprint = '9C:DC:80:19:8E:E1:32:A6:7E:B3:D4:EE:9E:CB:C5:BF:4E:50:BB:68';
var issuerCn    = 'Gandi Standard SSL CA 2';
var subjectCn   = 'crypto.cat';
var exponent    = '0x10001';
var modulus     = (
	'C4B6B422A47FB1902A7436FA90AC7B17B4D88DB595CCBA5C3EF8FAE09D0EBB4D' +
	'44326F15A1DF9D45AF371560D805C3A16182E1133BFEB1E8943190A1161AD1D6' +
	'DBD1029513A6241CA8D964CB47A4EF502DE360683864387FADCB6A16CBD7D536' +
	'AD9B19CE109CB4C7CC54C94AFA142B652820824516CA88CEC215B44CC3EE37CE' +
	'84FE9849B4B8BFAF9406F4E79F45F932275481506A9FB31054ABE188C967C780' +
	'7AF099A97B3CE87F748EA0FA2A7305A99BE892EE1C2679816C4690AF75785702' +
	'3756D65ED0C7B1B8F1BEED47E77C184B061FD9F86A2C5925199E495CED7C955C' +
	'608C0BDCAB23185704B97892FBE19910C88CCCD510E13150648B6174BF309FD5'
);

Cryptocat.Pinning.checkCertificate = function(callback) {
	HTTPS.get('https://crypto.cat/socket', function(res) {
		var cert = res.socket.getPeerCertificate();
		if (
			(cert.fingerprint === fingerprint) &&
			(cert.issuer.CN   ===    issuerCn) &&
			(cert.subject.CN  ===   subjectCn) &&
			(cert.exponent    ===    exponent) &&
			(cert.modulus     ===     modulus)
		) {
			callback(true);
		}
		else {
			callback(false);
		}
	});
	return false;
};

// Run on startup
Cryptocat.Pinning.checkCertificate(function(result) {
	if (!result) {
		Cryptocat.Diag.error.checkCertificate();
		Cryptocat.Win.main.beforeQuit();
	}
});

})();
