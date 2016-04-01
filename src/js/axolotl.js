Cryptocat.Axolotl = {};

(function() {
const Type_key = {
	construct: function() {
		return [
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00
		]
	},
	toBitstring: function(a) {
		return ('' +
			ProScript.encoding.b2h(a[ 0]) +
			ProScript.encoding.b2h(a[ 1]) +
			ProScript.encoding.b2h(a[ 2]) +
			ProScript.encoding.b2h(a[ 3]) +
			ProScript.encoding.b2h(a[ 4]) +
			ProScript.encoding.b2h(a[ 5]) +
			ProScript.encoding.b2h(a[ 6]) +
			ProScript.encoding.b2h(a[ 7]) +
			ProScript.encoding.b2h(a[ 8]) +
			ProScript.encoding.b2h(a[ 9]) +
			ProScript.encoding.b2h(a[10]) +
			ProScript.encoding.b2h(a[11]) +
			ProScript.encoding.b2h(a[12]) +
			ProScript.encoding.b2h(a[13]) +
			ProScript.encoding.b2h(a[14]) +
			ProScript.encoding.b2h(a[15]) +
			ProScript.encoding.b2h(a[16]) +
			ProScript.encoding.b2h(a[17]) +
			ProScript.encoding.b2h(a[18]) +
			ProScript.encoding.b2h(a[19]) +
			ProScript.encoding.b2h(a[20]) +
			ProScript.encoding.b2h(a[21]) +
			ProScript.encoding.b2h(a[22]) +
			ProScript.encoding.b2h(a[23]) +
			ProScript.encoding.b2h(a[24]) +
			ProScript.encoding.b2h(a[25]) +
			ProScript.encoding.b2h(a[26]) +
			ProScript.encoding.b2h(a[27]) +
			ProScript.encoding.b2h(a[28]) +
			ProScript.encoding.b2h(a[29]) +
			ProScript.encoding.b2h(a[30]) +
			ProScript.encoding.b2h(a[31])
		)
	},
	fromBitstring: function(a) {
		return ProScript.encoding.hexStringTo32ByteArray(a)
	},
	assert: function(a) {
		return [
			a[ 0], a[ 1], a[ 2], a[ 3],
			a[ 4], a[ 5], a[ 6], a[ 7],
			a[ 8], a[ 9], a[10], a[11],
			a[12], a[13], a[14], a[15],
			a[16], a[17], a[18], a[19],
			a[20], a[21], a[22], a[23],
			a[24], a[25], a[26], a[27],
			a[28], a[29], a[30], a[31]
		]
	},
	clone: function(a) {
		return [
			a[ 0], a[ 1], a[ 2], a[ 3],
			a[ 4], a[ 5], a[ 6], a[ 7],
			a[ 8], a[ 9], a[10], a[11],
			a[12], a[13], a[14], a[15],
			a[16], a[17], a[18], a[19],
			a[20], a[21], a[22], a[23],
			a[24], a[25], a[26], a[27],
			a[28], a[29], a[30], a[31]
		]
	}
}

const Type_iv = {
	construct: function() {
		return [
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00
		]
	},
	toBitstring: function(a) {
		return ('' +
			ProScript.encoding.b2h(a[ 0]) +
			ProScript.encoding.b2h(a[ 1]) +
			ProScript.encoding.b2h(a[ 2]) +
			ProScript.encoding.b2h(a[ 3]) +
			ProScript.encoding.b2h(a[ 4]) +
			ProScript.encoding.b2h(a[ 5]) +
			ProScript.encoding.b2h(a[ 6]) +
			ProScript.encoding.b2h(a[ 7]) +
			ProScript.encoding.b2h(a[ 8]) +
			ProScript.encoding.b2h(a[ 9]) +
			ProScript.encoding.b2h(a[10]) +
			ProScript.encoding.b2h(a[11])
		)
	},
	fromBitstring: function(a) {
		return ProScript.encoding.hexStringTo12ByteArray(a)
	},
	assert: function(a) {
		return [
			a[ 0], a[ 1], a[ 2], a[ 3],
			a[ 4], a[ 5], a[ 6], a[ 7],
			a[ 8], a[ 9], a[10], a[11]
		]
	}
}

const Type_msg = {
	construct: function() {
		return {
			valid: false,
			ephemeralKey: Type_key.construct(),
			initEphemeralKey: Type_key.construct(),
			ciphertext: '',
			iv: Type_iv.construct(),
			tag: '',
			preKeyId: 0
		}
	},
	assert: function(a) {
		a.valid          === true
		a.ephemeralKey     = Type_key.assert(a.ephemeralKey)
		a.initEphemeralKey = Type_key.assert(a.initEphemeralKey)
		a.ciphertext     === ''
		a.iv               = Type_iv.assert(a.iv)
		a.tag            === ''
		a.preKeyId         + 1
		return a
	}
}

const Type_keypair = {
	construct: function() {
		return {
			priv: Type_key.construct(),
			pub: Type_key.construct()
		}
	},
	assert: function(a) {
		a.priv = Type_key.assert(a.priv)
		a.pub  = Type_key.assert(a.pub)
		return a
	},
	clone: function(a) {
		var b  = Type_keypair.construct()
		b.priv = Type_key.clone(a.priv)
		b.pub  = Type_key.clone(a.pub)
		return b
	}
}

const Type_them = {
	construct: function() {
		return {
			signedPreKey: Type_key.construct(),
			signedPreKeySignature: '',
			identityKey: Type_key.construct(),
			identityDHKey: Type_key.construct(),
			myEphemeralKeyP0: Type_keypair.construct(),
			myEphemeralKeyP1: Type_keypair.construct(),
			myEphemeralKeyP2: Type_keypair.construct(),
			ephemeralKey: Type_key.construct(),
			myPreKey: Type_keypair.construct(),
			preKey: Type_key.construct(),
			preKeyId: 0,
			recvKeys: [
				Type_key.construct(),
				Type_key.construct()
			],
			sendKeys: [
				Type_key.construct(),
				Type_key.construct()
			],
			shared: Type_key.construct(),
			established: false
		}
	},
	assert: function(a) {
		a.signedPreKey          = Type_key.assert(a.signedPreKey)
		a.signedPreKeySignature = a.signedPreKeySignature + ''
		a.identityKey           = Type_key.assert(a.identityKey)
		a.identityDHKey         = Type_key.assert(a.identityDHKey)
		a.myEphemeralKeyP0      = Type_keypair.assert(a.myEphemeralKeyP0)
		a.myEphemeralKeyP1      = Type_keypair.assert(a.myEphemeralKeyP1)
		a.myEphemeralKeyP2      = Type_keypair.assert(a.myEphemeralKeyP2)
		a.ephemeralKey          = Type_key.assert(a.ephemeralKey)
		a.myPreKey              = Type_keypair.assert(a.myPreKey)
		a.preKey                = Type_key.assert(a.preKey)
		a.preKeyId              + 1
		a.recvKeys[0]           = Type_key.assert(a.recvKeys[0])
		a.recvKeys[1]           = Type_key.assert(a.recvKeys[1])
		a.sendKeys[0]           = Type_key.assert(a.sendKeys[0])
		a.sendKeys[1]           = Type_key.assert(a.sendKeys[1])
		a.shared                = Type_key.assert(a.shared)
		a.established           === true
		return a
	}
}

const Type_sendoutput = {
	construct: function() {
		return {
			them: Type_them.construct(),
			output: Type_msg.construct(),
		}
	},
	assert: function(a) {
		a.them   = Type_them.assert(a.them)
		a.output = Type_msg.assert(a.output)
		return a
	}
}

const Type_recvoutput = {
	construct: function() {
		return {
			them:   Type_them.construct(),
			output: Type_msg.construct(),
			plaintext: ''
		}
	},
	assert: function(a) {
		a.them   = Type_them.assert(a.them)
		a.output = Type_msg.assert(a.output)
		a.plaintext === ''
		return a
	}
}

const UTIL = {
	HKDF: function(ikm, salt, info) {
		const prk = ProScript.crypto.HMACSHA256(
			salt, Type_key.toBitstring(ikm)
		)
		const k0 = ProScript.crypto.HMACSHA256(
			prk, info + '01'
		)
		const k1 = ProScript.crypto.HMACSHA256(
			prk, Type_key.toBitstring(k0) + info + '02'
		)
		return [k0, k1]
	},
	QDHInit: function(
		myIdentityKeyPriv, myInitEphemeralKeyPriv, theirIdentityKeyPub,
		theirSignedPreKeyPub, theirPreKeyPub
	) {
		return Type_key.fromBitstring(ProScript.crypto.SHA256(
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myIdentityKeyPriv, theirSignedPreKeyPub
			)) + 
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myInitEphemeralKeyPriv, theirIdentityKeyPub
			)) +
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myInitEphemeralKeyPriv, theirSignedPreKeyPub
			)) +
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myInitEphemeralKeyPriv, theirPreKeyPub
			))
		))
	},
	QDHResp: function(
		myIdentityKeyPriv, mySignedPreKeyPriv, myPreKeyPriv,
		theirIdentityKeyPub, theirEphemeralKeyPub
	) {
		return Type_key.fromBitstring(ProScript.crypto.SHA256(
			Type_key.toBitstring(ProScript.crypto.DH25519(
				mySignedPreKeyPriv, theirIdentityKeyPub
			)) +
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myIdentityKeyPriv, theirEphemeralKeyPub
			)) +
			Type_key.toBitstring(ProScript.crypto.DH25519(
				mySignedPreKeyPriv, theirEphemeralKeyPub
			)) +
			Type_key.toBitstring(ProScript.crypto.DH25519(
				myPreKeyPriv, theirEphemeralKeyPub
			))
		))
	},
	getShare: function(a, b) {
		if (
			Type_key.toBitstring(a) ===
			'0000000000000000000000000000000000000000000000000000000000000000'
		) {
			return b
		}
		else {
			return a
		}
	},
	newIdentityKey: function(id) {
		const identityKeyPriv = ProScript.crypto.random32Bytes('aID' + id)
		return Type_keypair.assert({
			priv:identityKeyPriv,
			pub: ProScript.crypto.ED25519.publicKey(identityKeyPriv),
		})
	},
	newKeyPair: function(id) {
		const priv = ProScript.crypto.random32Bytes('aPK' + id)
		return {
			priv: priv,
			pub: ProScript.crypto.DH25519(priv, [
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09
			])
		}
	},
	getDHPublicKey: function(priv) {
		return ProScript.crypto.DH25519(priv, [
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09
		])
	}
}

const RATCHET = {
	deriveSendKeys: function(them, myEphemeralKeyPriv) {
		const theirShare = UTIL.getShare(
			them.ephemeralKey, them.signedPreKey
		)
		const kShared = ProScript.crypto.DH25519(
			myEphemeralKeyPriv, theirShare
		)
		const sendKeys = UTIL.HKDF(
			kShared, them.recvKeys[0], 'WhisperRatchet'
		)
		const kKeys = UTIL.HKDF(
			ProScript.crypto.HMACSHA256(sendKeys[1], '1'),
			Type_key.construct(),
			'WhisperMessageKeys'
		)
		return {
			sendKeys: sendKeys,
			recvKeys: them.recvKeys,
			kENC:     kKeys[0]
		}
	},
	deriveRecvKeys: function(myShare, them, theirEphemeralKeyPub) {
		const kShared = ProScript.crypto.DH25519(
			myShare, theirEphemeralKeyPub
		)
		const recvKeys = UTIL.HKDF(
			kShared, them.sendKeys[0], 'WhisperRatchet'
		)
		const kKeys = UTIL.HKDF(
			ProScript.crypto.HMACSHA256(recvKeys[1], '1'),
			Type_key.construct(),
			'WhisperMessageKeys'
		)
		return {
			sendKeys: them.sendKeys,
			recvKeys: recvKeys,
			kENC: kKeys[0]
		}
	},
	attemptDecrypt: function(myIdentityKey, mySignedPreKey, myEphemeralKey, them, msg) {
		var keys = RATCHET.deriveRecvKeys(
			UTIL.getShare(myEphemeralKey.priv, mySignedPreKey.priv),
			them, msg.ephemeralKey
		)
		var hENC = Type_key.fromBitstring(ProScript.crypto.SHA256(
			Type_key.toBitstring(keys.kENC) + Type_iv.toBitstring(msg.iv)
		))
		var aes = ProScript.crypto.AESGCMDecrypt(
			hENC, msg.iv, {
				ciphertext: msg.ciphertext,
				tag: msg.tag
			}, (
				Type_key.toBitstring(msg.initEphemeralKey) +
				Type_key.toBitstring(msg.ephemeralKey)     +
				Type_key.toBitstring(myEphemeralKey.pub)   + 
				Type_key.toBitstring(them.identityKey)     + 
				Type_key.toBitstring(myIdentityKey.pub)
			)
		)
		return {
			keys: keys,
			aes: aes
		}
	}
}

const HANDLE = {
	AKENeeded: function(myIdentityKey, initEphemeralKey, them) {
		const shared = UTIL.QDHInit(
			myIdentityKey.priv, initEphemeralKey.priv,
			them.identityDHKey, them.signedPreKey, them.preKey
		)
		const recvKeys = UTIL.HKDF(
			shared, Type_key.construct(), 'WhisperRatchet'
		)
		const validSig = ProScript.crypto.ED25519.checkValid(
			them.signedPreKeySignature, Type_key.toBitstring(them.signedPreKey),
			them.identityKey
		)
		return {
			signedPreKey: them.signedPreKey,
			signedPreKeySignature: them.signedPreKeySignature,
			identityKey: them.identityKey,
			identityDHKey: them.identityDHKey,
			myEphemeralKeyP0: them.myEphemeralKeyP0,
			myEphemeralKeyP1: them.myEphemeralKeyP1,
			myEphemeralKeyP2: them.myEphemeralKeyP2,
			ephemeralKey: them.ephemeralKey,
			myPreKey: them.myPreKey,
			preKey: them.preKey,
			preKeyId: them.preKeyId,
			recvKeys: recvKeys,
			sendKeys: them.sendKeys,
			shared: shared,
			established: validSig
		}
	},

	AKEInit: function(myIdentityKey, mySignedPreKey, them, msg) {
		const shared = UTIL.QDHResp(
			myIdentityKey.priv, mySignedPreKey.priv,
			them.myPreKey.priv, them.identityDHKey, msg.initEphemeralKey
		)
		const sendKeys = UTIL.HKDF(
			shared, Type_key.construct(), 'WhisperRatchet'
		)
		return {
			signedPreKey: them.signedPreKey,
			signedPreKeySignature: them.signedPreKeySignature,
			identityKey: them.identityKey,
			identityDHKey: them.identityDHKey,
			myEphemeralKeyP0: them.myEphemeralKeyP0,
			myEphemeralKeyP1: them.myEphemeralKeyP1,
			myEphemeralKeyP2: them.myEphemeralKeyP2,
			ephemeralKey: them.ephemeralKey,
			myPreKey: them.myPreKey,
			preKey: them.preKey,
			preKeyId: msg.preKeyId,
			recvKeys: them.recvKeys,
			sendKeys: sendKeys,
			shared: shared,
			established: true
		}
	},

	sending: function(myIdentityKey, them, initEphemeralKeyPub, myEphemeralKeyP2, plaintext) {
		const keys = RATCHET.deriveSendKeys(them, myEphemeralKeyP2.priv)
		const iv   = Type_iv.assert(ProScript.crypto.random12Bytes('a1'))
		const hENC = Type_key.fromBitstring(ProScript.crypto.SHA256(
			Type_key.toBitstring(keys.kENC) + Type_iv.toBitstring(iv)
		))
		const enc  = ProScript.crypto.AESGCMEncrypt(
			hENC, iv, plaintext, (
				Type_key.toBitstring(initEphemeralKeyPub)  +
				Type_key.toBitstring(myEphemeralKeyP2.pub) +
				Type_key.toBitstring(them.ephemeralKey)    + 
				Type_key.toBitstring(myIdentityKey.pub)    +
				Type_key.toBitstring(them.identityKey)
			)
		)
		return {
			them: {
				signedPreKey: them.signedPreKey,
				signedPreKeySignature: them.signedPreKeySignature,
				identityKey: them.identityKey,
				identityDHKey: them.identityDHKey,
				myEphemeralKeyP0: them.myEphemeralKeyP0,
				myEphemeralKeyP1: them.myEphemeralKeyP1,
				myEphemeralKeyP2: myEphemeralKeyP2,
				ephemeralKey: them.ephemeralKey,
				myPreKey: them.myPreKey,
				preKey: them.preKey,
				preKeyId: them.preKeyId,
				recvKeys: [keys.recvKeys[0], keys.recvKeys[1]],
				sendKeys: [keys.sendKeys[0], keys.sendKeys[1]],
				shared: them.shared,
				established: them.established
			},
			output: {
				valid: true && them.established,
				ephemeralKey: myEphemeralKeyP2.pub,
				initEphemeralKey: initEphemeralKeyPub,
				ciphertext: enc.ciphertext,
				iv: iv,
				tag: enc.tag,
				preKeyId: them.preKeyId
			}
		}
	},

	receiving: function(myIdentityKey, mySignedPreKey, them, msg) {
		var them = Type_them.assert(them)
		var dec  = RATCHET.attemptDecrypt(
			myIdentityKey, mySignedPreKey, them.myEphemeralKeyP2, them, msg
		)
		if (dec.aes.valid) {
			return {
				them: {
					signedPreKey: them.signedPreKey,
					signedPreKeySignature: them.signedPreKeySignature,
					identityKey: them.identityKey,
					identityDHKey: them.identityDHKey,
					myEphemeralKeyP0: them.myEphemeralKeyP1,
					myEphemeralKeyP1: them.myEphemeralKeyP2,
					myEphemeralKeyP2: UTIL.newKeyPair('a2'),
					ephemeralKey: msg.ephemeralKey,
					myPreKey: them.myPreKey,
					preKey: them.preKey,
					preKeyId: msg.preKeyId,
					recvKeys: dec.keys.recvKeys,
					sendKeys: dec.keys.sendKeys,
					shared: them.shared,
					established: them.established
				},
				output: {
					valid: dec.aes.valid && them.established,
					ephemeralKey: Type_key.construct(),
					initEphemeralKey: Type_key.construct(),
					ciphertext: '',
					iv: Type_iv.construct(),
					tag: '',
					preKeyId: msg.preKeyId
				},
				plaintext: dec.aes.plaintext
			}
		}
		else {
			dec = RATCHET.attemptDecrypt(
				myIdentityKey, mySignedPreKey, them.myEphemeralKeyP1, them, msg
			)
			if (dec.aes.valid) {
				return {
					them: {
						signedPreKey: them.signedPreKey,
						signedPreKeySignature: them.signedPreKeySignature,
						identityKey: them.identityKey,
						identityDHKey: them.identityDHKey,
						myEphemeralKeyP0: them.myEphemeralKeyP0,
						myEphemeralKeyP1: them.myEphemeralKeyP1,
						myEphemeralKeyP2: them.myEphemeralKeyP2,
						ephemeralKey: msg.ephemeralKey,
						myPreKey: them.myPreKey,
						preKey: them.preKey,
						preKeyId: msg.preKeyId,
						recvKeys: dec.keys.recvKeys,
						sendKeys: dec.keys.sendKeys,
						shared: them.shared,
						established: them.established
					},
					output: {
						valid: dec.aes.valid && them.established,
						ephemeralKey: Type_key.construct(),
						initEphemeralKey: Type_key.construct(),
						ciphertext: '',
						iv: Type_iv.construct(),
						tag: '',
						preKeyId: msg.preKeyId
					},
					plaintext: dec.aes.plaintext
				}
			}
			else {
				dec = RATCHET.attemptDecrypt(
					myIdentityKey, mySignedPreKey, them.myEphemeralKeyP0, them, msg
				)
				return {
					them: {
						signedPreKey: them.signedPreKey,
						signedPreKeySignature: them.signedPreKeySignature,
						identityKey: them.identityKey,
						identityDHKey: them.identityDHKey,
						myEphemeralKeyP0: them.myEphemeralKeyP0,
						myEphemeralKeyP1: them.myEphemeralKeyP1,
						myEphemeralKeyP2: them.myEphemeralKeyP2,
						ephemeralKey: msg.ephemeralKey,
						myPreKey: them.myPreKey,
						preKey: them.preKey,
						preKeyId: msg.preKeyId,
						recvKeys: dec.keys.recvKeys,
						sendKeys: dec.keys.sendKeys,
						shared: them.shared,
						established: them.established
					},
					output: {
						valid: dec.aes.valid && them.established,
						ephemeralKey: Type_key.construct(),
						initEphemeralKey: Type_key.construct(),
						ciphertext: '',
						iv: Type_iv.construct(),
						tag: '',
						preKeyId: msg.preKeyId
					},
					plaintext: dec.aes.plaintext
				}
			}
		}
	}
}

const Axolotl = {	
	newSession: function(
		myPreKey, theirIdentityKeyPub, theirIdentityDHKeyPub, theirSignedPreKeyPub,
		theirSignedPreKeySignature, theirPreKeyPub, preKeyId
	) {
		return {
			signedPreKey:          Type_key.fromBitstring(theirSignedPreKeyPub),
			signedPreKeySignature: theirSignedPreKeySignature,
			identityKey:           Type_key.fromBitstring(theirIdentityKeyPub),
			identityDHKey:         Type_key.fromBitstring(theirIdentityDHKeyPub),
			myEphemeralKeyP0:      Type_keypair.construct(),
			myEphemeralKeyP1:      Type_keypair.construct(),
			myEphemeralKeyP2:      Type_keypair.construct(),
			ephemeralKey:          Type_key.construct(),
			myPreKey:              Type_keypair.assert(myPreKey),
			preKey:                Type_key.fromBitstring(theirPreKeyPub),
			preKeyId:              preKeyId + 0,
			recvKeys:              [Type_key.construct(), Type_key.construct()],
			sendKeys:              [Type_key.construct(), Type_key.construct()],
			shared:                Type_key.construct(),
			established:           false
		}
	},

	send: function(myIdentityKey, them, plaintext) {
		var myIdentityKey    = Type_keypair.assert(myIdentityKey)
		var them             = Type_them.assert(them)
		var initEphemeralKey = Type_keypair.construct()
		if (them.established === false) {
			initEphemeralKey = UTIL.newKeyPair('a4')
			return HANDLE.sending(
				myIdentityKey,
				HANDLE.AKENeeded(myIdentityKey, initEphemeralKey, them),
				initEphemeralKey.pub,
				UTIL.newKeyPair('a5'),
				plaintext
			)
		}
		else {
			return HANDLE.sending(
				myIdentityKey,
				them,
				Type_key.construct(),
				them.myEphemeralKeyP2,
				plaintext
			)
		}
	},

	recv: function(myIdentityKey, mySignedPreKey, them, msg) {
		var myIdentityKey  = Type_keypair.assert(myIdentityKey)
		var mySignedPreKey = Type_keypair.assert(mySignedPreKey)
		var them = Type_them.assert(them)
		var msg  = Type_msg.assert(msg)
		if (them.established === false) {
			return HANDLE.receiving(
				myIdentityKey,
				mySignedPreKey,
				HANDLE.AKEInit(myIdentityKey, mySignedPreKey, them, msg),
				msg
			)
		}
		else {
			return HANDLE.receiving(
				myIdentityKey,
				mySignedPreKey,
				them,
				msg
			)
		}
	}
}

Cryptocat.Axolotl = {
	newIdentityKey: UTIL.newIdentityKey,
	getDHPublicKey: UTIL.getDHPublicKey,
	newKeyPair:     UTIL.newKeyPair,
	newSession:     Axolotl.newSession,
	send:           Axolotl.send,
	recv:           Axolotl.recv
}
})();
