var ProScript = {
};
ProScript.encoding = {
	ascii: "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff",
	ascii_table: {
		"0": 48,
		"1": 49,
		"2": 50,
		"3": 51,
		"4": 52,
		"5": 53,
		"6": 54,
		"7": 55,
		"8": 56,
		"9": 57,
		"\x00": 0,
		"\x01": 1,
		"\x02": 2,
		"\x03": 3,
		"\x04": 4,
		"\x05": 5,
		"\x06": 6,
		"\x07": 7,
		"\b": 8,
		"\t": 9,
		"\n": 10,
		"\x0b": 11,
		"\f": 12,
		"\r": 13,
		"\x0e": 14,
		"\x0f": 15,
		"\x10": 16,
		"\x11": 17,
		"\x12": 18,
		"\x13": 19,
		"\x14": 20,
		"\x15": 21,
		"\x16": 22,
		"\x17": 23,
		"\x18": 24,
		"\x19": 25,
		"\x1a": 26,
		"\x1b": 27,
		"\x1c": 28,
		"\x1d": 29,
		"\x1e": 30,
		"\x1f": 31,
		" ": 32,
		"!": 33,
		'"': 34,
		"#": 35,
		"$": 36,
		"%": 37,
		"&": 38,
		"'": 39,
		"(": 40,
		")": 41,
		"*": 42,
		"+": 43,
		",": 44,
		"-": 45,
		".": 46,
		"/": 47,
		":": 58,
		";": 59,
		"<": 60,
		"=": 61,
		">": 62,
		"?": 63,
		"@": 64,
		"A": 65,
		"B": 66,
		"C": 67,
		"D": 68,
		"E": 69,
		"F": 70,
		"G": 71,
		"H": 72,
		"I": 73,
		"J": 74,
		"K": 75,
		"L": 76,
		"M": 77,
		"N": 78,
		"O": 79,
		"P": 80,
		"Q": 81,
		"R": 82,
		"S": 83,
		"T": 84,
		"U": 85,
		"V": 86,
		"W": 87,
		"X": 88,
		"Y": 89,
		"Z": 90,
		"[": 91,
		"\\": 92,
		"]": 93,
		"^": 94,
		"_": 95,
		"`": 96,
		"a": 97,
		"b": 98,
		"c": 99,
		"d": 100,
		"e": 101,
		"f": 102,
		"g": 103,
		"h": 104,
		"i": 105,
		"j": 106,
		"k": 107,
		"l": 108,
		"m": 109,
		"n": 110,
		"o": 111,
		"p": 112,
		"q": 113,
		"r": 114,
		"s": 115,
		"t": 116,
		"u": 117,
		"v": 118,
		"w": 119,
		"x": 120,
		"y": 121,
		"z": 122,
		"{": 123,
		"|": 124,
		"}": 125,
		"~": 126,
		"\x7f": 127,
		"\x80": 128,
		"\x81": 129,
		"\x82": 130,
		"\x83": 131,
		"\x84": 132,
		"\x85": 133,
		"\x86": 134,
		"\x87": 135,
		"\x88": 136,
		"\x89": 137,
		"\x8a": 138,
		"\x8b": 139,
		"\x8c": 140,
		"\x8d": 141,
		"\x8e": 142,
		"\x8f": 143,
		"\x90": 144,
		"\x91": 145,
		"\x92": 146,
		"\x93": 147,
		"\x94": 148,
		"\x95": 149,
		"\x96": 150,
		"\x97": 151,
		"\x98": 152,
		"\x99": 153,
		"\x9a": 154,
		"\x9b": 155,
		"\x9c": 156,
		"\x9d": 157,
		"\x9e": 158,
		"\x9f": 159,
		"\xa0": 160,
		"\xa1": 161,
		"\xa2": 162,
		"\xa3": 163,
		"\xa4": 164,
		"\xa5": 165,
		"\xa6": 166,
		"\xa7": 167,
		"\xa8": 168,
		"\xa9": 169,
		"\xaa": 170,
		"\xab": 171,
		"\xac": 172,
		"\xad": 173,
		"\xae": 174,
		"\xaf": 175,
		"\xb0": 176,
		"\xb1": 177,
		"\xb2": 178,
		"\xb3": 179,
		"\xb4": 180,
		"\xb5": 181,
		"\xb6": 182,
		"\xb7": 183,
		"\xb8": 184,
		"\xb9": 185,
		"\xba": 186,
		"\xbb": 187,
		"\xbc": 188,
		"\xbd": 189,
		"\xbe": 190,
		"\xbf": 191,
		"\xc0": 192,
		"\xc1": 193,
		"\xc2": 194,
		"\xc3": 195,
		"\xc4": 196,
		"\xc5": 197,
		"\xc6": 198,
		"\xc7": 199,
		"\xc8": 200,
		"\xc9": 201,
		"\xca": 202,
		"\xcb": 203,
		"\xcc": 204,
		"\xcd": 205,
		"\xce": 206,
		"\xcf": 207,
		"\xd0": 208,
		"\xd1": 209,
		"\xd2": 210,
		"\xd3": 211,
		"\xd4": 212,
		"\xd5": 213,
		"\xd6": 214,
		"\xd7": 215,
		"\xd8": 216,
		"\xd9": 217,
		"\xda": 218,
		"\xdb": 219,
		"\xdc": 220,
		"\xdd": 221,
		"\xde": 222,
		"\xdf": 223,
		"\xe0": 224,
		"\xe1": 225,
		"\xe2": 226,
		"\xe3": 227,
		"\xe4": 228,
		"\xe5": 229,
		"\xe6": 230,
		"\xe7": 231,
		"\xe8": 232,
		"\xe9": 233,
		"\xea": 234,
		"\xeb": 235,
		"\xec": 236,
		"\xed": 237,
		"\xee": 238,
		"\xef": 239,
		"\xf0": 240,
		"\xf1": 241,
		"\xf2": 242,
		"\xf3": 243,
		"\xf4": 244,
		"\xf5": 245,
		"\xf6": 246,
		"\xf7": 247,
		"\xf8": 248,
		"\xf9": 249,
		"\xfa": 250,
		"\xfb": 251,
		"\xfc": 252,
		"\xfd": 253,
		"\xfe": 254,
		"\xff": 255
	},
	b2h: function(c) {
		var t = '0123456789abcdef';
		var a = (c >> 4) & 15;
		var b = c & 15;
		return (
			((a >>>= 0) < t.length ? t[a] : "0") +
			((b >>>= 0) < t.length ? t[b] : "0")
		);
	},
	b2a: function(n) {
		var a = this.ascii + '';
		return (n >>>= 0) < a.length ? a[n] : "\x00";
	},
	a2b: function(a) {
		var t = this.ascii_table;
		return (a.length == 1 && a <= "\xFF" ? t[a] : 0);
	},
	a2h: function(s) {
		var res = '',
			i = 0,
			s = s + '';
		for (i = 0; i < s.length; i++) {
			res += this.b2h(this.a2b(s[i]));
		}
		return res;
	},
	h2a: function(s) {
		var i = 0,
			u = 0,
			c = '',
			res = "",
			t = this.ascii + '',
			s = s + '';
		for (i = 0; i < s.length; i++) {
			if (!(i & 1)) c = s[i];
			else {
				u = +('0x' + c + s[i]);
				res += (u >>>= 0) < t.length ? t[u] : "\x00";
			}
		}
		return res;
	},
	byteArrayToHexString: function(a) {
		var i = 0;
		var s = '';
		var b2h = ProScript.encoding.b2h;
		for (i = 0; i < a.length; i++) {
			s += b2h(a[i]); 
		}
		return s;
	},
	hexStringTo12ByteArray: function(s) {
		var i = 0;
		var c = 0;
		var a = [
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		];
		for (i = 0; i < 12; i++) {
			a[i] = this.a2b(this.h2a(
				s[c] + s[c+1]
			));
			c += 2;
		}
		return a;
	},
	hexStringTo16ByteArray: function(s) {
		var i = 0;
		var c = 0;
		var a = [
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		];
		for (i = 0; i < 16; i++) {
			a[i] = this.a2b(this.h2a(
				s[c] + s[c+1]
			));
			c += 2;
		}
		return a;
	},
	hexStringTo32ByteArray: function(s) {
		var i = 0;
		var c = 0;
		var a = [
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		];
		for (i = 0; i < 32; i++) {
			a[i] = this.a2b(this.h2a(
				s[c] + s[c+1]
			));
			c += 2;
		}
		return a;
	}
};
ProScript.bigInteger = {
	BI_DB: 28,
	BI_DM: 268435455,
	BI_DV: 268435456,
	BI_FV: 4503599627370496,
	BI_F1: 24,
	BI_F2: 4,
	/** Create a new BigInteger initialized from the given hex value.
	 * @param {Array} Byte representation of initial value.
	 * @returns {BigInteger} A BigInteger structure.
	 */
	create: function(v) {
		var s = '';
		var i = 0;
		for (i = 0; i < v.length; i++) {
			s += ProScript.encoding.b2h(v[i]);
		}
		return this.createFromString(s);
	},
	am: function(th, i, x, w, j, c, n) {
		var a = th.array,
			b = w.array,
			l = 0,
			m = 0,
			xl = x & 0x3fff,
			xh = x >> 14,
			h = 0;
		while (--n >= 0) {
			l = a[i & 255] & 0x3fff;
			i
			h = a[i++ & 255] >> 14;
			m = xh * l + h * xl;
			l = xl * l + ((m & 0x3fff) << 14) + b[j & 255] + c;
			c = (l >> 28) + (m >> 14) + xh * h;
			b[j++ & 255] = l & 0xfffffff;
		}
		return c;
	},
	createFromString: function(v) {
		var neg = false,
			p = '',
			b = '',
			s = '' + v,
			i = 0,
			j = 0,
			a = [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
			],
			res = {
				array: a,
				t: 0,
				s: 0
			};
		i = s.length;
		while (--i >= 0) {
			b = (i >>>= 0) < s.length ? s[i] : "0";
			if (i == 0 && b == '-') {
				neg = true;
				continue;
			}
			p = b + p;
			if (j++ % 7 == 6) {
				a[res.t++ & 255] = +('0x' + p);
				p = '';
			}
		}
		if (!!p) a[res.t++ & 255] = +('0x' + p);
		p = '';
		if (neg) res = this.negate(res);
		this.clamp(res);
		return res;
	},
	/** Copy the value of a BigInteger to another.
	 * @param {BigInteger} source Integer to copy.
	 * @param {BigInteger} target Target of copy.
	 * @returns {BigInteger} Returns the target of the copy.
	 */
	copyTo: function(th, r) {
		var ta = th.array,
			ra = r.array,
			i = 0;
		for (i = th.t - 1; i >= 0; --i) ra[i & 255] = ta[i & 255];
		r.t = th.t;
		r.s = th.s;
		return r;
	},
	clamp: function(th) {
		var a = th.array,
			c = th.s & this.BI_DM;
		while (th.t > 0 && a[(th.t - 1) & 255] == c)--th.t;
	},
	/** Convert BigInteger to its hex representation.
	 * @param {BigInteger} n Number to convert
	 * @returns {string} Hex representation of n, as a string.
	 */
	toString: function(th) {
		var a = th.array,
			c = 0,
			i = 0,
			j = 0,
			hex = '0123456789abcdef',
			k = 0,
			nz = false,
			h = '',
			res = '';
		if (th.s < 0) return "-" + this.toString(this.negate(th));
		for (i = th.t - 1; i >= 0; i--) {
			c = a[i & 255];
			for (j = 24; j >= 0; j -= 4) {
				k = (c >> j) & 15;
				h = (k >>>= 0) < hex.length ? hex[k] : "0";
				if (h != '0') nz = true;
				if (nz) res += h;
			}
		}
		return !res ? '0' : res;
	},
	/** Change sign of number.
	 * @param {BigInteger} n Input number
	 * @returns {BigInteger} A newly allocated BigInteger with opposite value
	 */
	negate: function(th) {
		var t = this.create([0]),
			z = this.create([0]);
		this.subTo(z, th, t);
		return t;
	},
	/** Absolute value.
	 * @param {BigInteger} n Input number
	 * @returns {BigInteger} If n is positive, returns n, otherwise return negate(n)
	 */
	abs: function(th) {
		return th.s < 0 ? this.negate(th) : th;
	},
	/** Exclusive OR of two numbers
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} m Second operand
	 * @returns {BigInteger} n xor m
	 */
	xor: function(th, a) {
		var x = th.array,
			y = a.array,
			r = this.create([0]),
			z = r.array,
			i = (th.t > a.t) ? th.t : a.t;
		r.t = i;
		while (--i >= 0) z[i & 255] = x[i & 255] ^ y[i & 255];
		return r;
	},
	/** Comparison of BigInteger.
	 * @param {BigInteger} n First value
	 * @param {BigInteger} m Second value
	 * @returns {number} A negative value if n<m, 0 if n=m and a positive value otherwise.
	 */
	compareTo: function(th, a) {
		var x = th.array,
			y = a.array,
			i = th.t,
			r = th.s - a.s,
			s = th.t - a.t;
		if (!!r) return r;
		if (!!s) return s;
		while (--i >= 0)
			if ((r = (x[i & 255] - y[i & 255])) != 0) return r;
		return 0;
	},
	/** Index of the first non-zero bit starting from the least significant bit.
	 * @param {number} n  Input number
	 * @returns {number} the bit length of n. Can behave strangely on negative and float values.
	 */
	nbits: function(x) {
		var r = 1,
			t = 0;
		if ((t = x >>> 16) != 0) {
			x = t;
			r += 16;
		}
		if ((t = x >> 8) != 0) {
			x = t;
			r += 8;
		}
		if ((t = x >> 4) != 0) {
			x = t;
			r += 4;
		}
		if ((t = x >> 2) != 0) {
			x = t;
			r += 2;
		}
		if ((t = x >> 1) != 0) {
			x = t;
			r += 1;
		}
		return r;
	},
	/** Index of first non-zero bit starting from the LSB of the given BigInteger.
	 * @param {BigInteger} n Input BigInteger
	 * @returns {number} the bit length of n.
	 */
	bitLength: function(th) {
		var a = th.array;
		if (th.t <= 0) return 0;
		return this.BI_DB * (th.t - 1) + this.nbits(a[(th.t - 1) & 255] ^ (th.s &
			this.BI_DM));
	},
	DLshiftTo: function(th, n, r) {
		var a = th.array,
			b = r.array,
			i = 0;
		for (i = th.t - 1; i >= 0; --i) b[(i + n) & 255] = a[i & 255];
		for (i = n - 1; i >= 0; --i) b[i & 255] = 0;
		r.t = th.t + n;
		r.s = th.s;
	},
	DRshiftTo: function(th, n, r) {
		var a = th.array,
			b = r.array,
			i = 0;
		for (i = n; i < th.t; ++i) b[(i - n) & 255] = a[i & 255];
		r.t = th.t > n ? th.t - n : 0;
		r.s = th.s;
	},
	/** Logical shift to the left
	 * @param {BigInteger} n Input number
	 * @param {number} k Number of positions to shift
	 * @param {BigInteger} r Target number to store the result to
	 */
	LshiftTo: function(th, n, r) {
		var a = th.array,
			b = r.array,
			bs = n % this.BI_DB,
			cbs = this.BI_DB - bs,
			bm = (1 << cbs) - 1,
			ds = (n / this.BI_DB) | 0,
			c = (th.s << bs) & this.BI_DM,
			i = 0;
		for (i = th.t - 1; i >= 0; --i) b[(i + ds + 1) & 255] = (a[i & 255] >> cbs) |
			c, c = (a[i & 255] & bm) << bs;
		for (i = ds - 1; i >= 0; --i) b[i & 255] = 0;
		b[ds & 255] = c;
		r.t = th.t + ds + 1;
		r.s = th.s;
		this.clamp(r);
	},
	/** Logical shift to the right.
	 * @param {BigInteger} n Input number
	 * @param {number} k Number of positions to shift
	 * @param {BigInteger} r Target number to store the result to
	 */
	RshiftTo: function(th, n, r) {
		var a = th.array,
			b = r.array,
			i = 0,
			bs = n % this.BI_DB,
			cbs = this.BI_DB - bs,
			bm = (1 << bs) - 1,
			ds = (n / this.BI_DB) | 0;
		r.s = th.s;
		if (ds >= th.t) {
			r.t = 0;
			return;
		}
		b[0] = a[ds & 255] >> bs;
		for (i = ds + 1; i < th.t; ++i) b[(i - ds - 1) & 255] |= (a[i & 255] & bm) <<
			cbs,
			b[(i - ds) & 255] = a[i & 255] >> bs;
		if (bs > 0) b[(th.t - ds - 1) & 255] |= (th.s & bm) << cbs;
		r.t = th.t - ds;
		this.clamp(r);
	},
	/** Subtraction of BigIntegers.
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} m Second operand
	 * @param {BigInteger} r Target number to store the result (n-m) to.
	 */
	subTo: function(th, y, r) {
		var a = th.array,
			z = r.array,
			b = y.array,
			i = 0,
			c = 0,
			m = y.t < th.t ? y.t : th.t;
		while (i < m) {
			c += a[i & 255] - b[i & 255];
			z[i++ & 255] = c & this.BI_DM;
			c >>= this.BI_DB;
		}
		if (y.t < th.t) {
			c -= y.s;
			while (i < th.t) {
				c += a[i & 255];
				z[i++ & 255] = c & this.BI_DM;
				c >>= this.BI_DB;
			}
			c += th.s;
		} else {
			c += th.s;
			while (i < y.t) {
				c -= b[i & 255];
				z[i++ & 255] = c & this.BI_DM;
				c >>= this.BI_DB;
			}
			c -= y.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c < -1) z[i++ & 255] = this.BI_DV + c;
		else if (c > 0) z[i++ & 255] = c;
		r.t = i;
		this.clamp(r);
	},
	/** Multiplication of BigIntegers.
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} m Second operand
	 * @param {BigInteger} r Target number to store the result (n*m) to.
	 */
	multiplyTo: function(th, a, r) {
		var u = th.array,
			v = r.array,
			x = this.abs(th),
			y = this.abs(a),
			w = y.array,
			i = x.t;
		r.t = i + y.t;
		while (--i >= 0) v[i & 255] = 0;
		for (i = 0; i < y.t; ++i) v[(i + x.t) & 255] = this.am(x, 0, w[i & 255], r,
			i, 0, x.t);
		r.s = 0;
		this.clamp(r);
		if (th.s != a.s) this.subTo(this.create([0]), r, r);
	},
	/** Squaring of a BigInteger.
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} r Target number to store the result (n*n) to.
	 */
	squareTo: function(th, r) {
		var x = this.abs(th),
			u = x.array,
			v = r.array,
			i = (r.t = 2 * x.t),
			c = 0;
		while (--i >= 0) v[i & 255] = 0;
		for (i = 0; i < x.t - 1; ++i) {
			c = this.am(x, i, u[i & 255], r, 2 * i, 0, 1);
			if ((v[(i + x.t) & 255] += this.am(x, i + 1, 2 * u[i & 255], r, 2 * i + 1,
				c, x.t - i - 1)) >= this.BI_DV) v[(i + x.t) & 255] -= this.BI_DV, v[(i +
				x.t + 1) & 255] = 1;
		}
		if (r.t > 0) v[(r.t - 1) & 255] += this.am(x, i, u[i & 255], r, 2 * i, 0, 1);
		r.s = 0;
		this.clamp(r);
	},
	/** Euclidean division of two BigIntegers.
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} m Second operand
	 * @returns {BigInteger[]} Returns an array of two BigIntegers: first element is the quotient, second is the remainder.
	 */
	divRem: function(th, div) {
		var m = this.abs(div),
			t = this.abs(th),
			ma = m.array,
			ta = th.array,
			ts = th.s,
			ms = m.s,
			nsh = this.BI_DB - this.nbits(ma[(m.t - 1) & 255]),
			q = this.create([0]),
			r = this.create([0]),
			qa = q.array,
			ra = r.array,
			qd = 0,
			y = this.create([0]),
			ya = y.array,
			ys = 0,
			y0 = 0,
			yt = 0,
			i = 0,
			j = 0,
			d1 = 0,
			d2 = 0,
			e = 0;
		if (t.t < m.t) this.copyTo(th, r);
		if (!m.t || t.t < m.t) return [q, r];
		if (nsh > 0) {
			this.LshiftTo(m, nsh, y);
			this.LshiftTo(t, nsh, r);
		} else {
			this.copyTo(m, y);
			this.copyTo(m, r);
		}
		ys = y.t;
		y0 = ya[(ys - 1) & 255];
		if (y0 == 0) return [q, r];
		yt = y0 * (1 << this.BI_F1) + ((ys > 1) ? ya[(ys - 2) & 255] >> this.BI_F2 :
			0);
		d1 = this.BI_FV / yt, d2 = (1 << this.BI_F1) / yt, e = 1 << this.BI_F2;
		i = r.t, j = i - ys;
		this.DLshiftTo(y, j, q);
		if (this.compareTo(r, q) >= 0) {
			ra[r.t++ & 255] = 1;
			this.subTo(r, q, r);
		}
		this.DLshiftTo(this.create([1]), ys, q);
		this.subTo(q, y, y);
		while (y.t < ys) ya[y.t++ & 255] = 0;
		while (--j >= 0) {
			qd = (ra[--i & 255] == y0) ? this.BI_DM : (ra[i & 255] * d1 + (ra[(i - 1) &
				255] + e) * d2) | 0;
			if ((ra[i & 255] += this.am(y, 0, qd, r, j, 0, ys)) < qd) {
				this.DLshiftTo(y, j, q);
				this.subTo(r, q, r);
				while (ra[i & 255] < --qd) this.subTo(r, q, r);
			}
		}
		this.DRshiftTo(r, ys, q);
		if (ts != ms) this.subTo(this.create([0]), q, q);
		r.t = ys;
		this.clamp(r);
		if (nsh > 0) this.RshiftTo(r, nsh, r);
		if (ts < 0) this.subTo(this.create([0]), r, r);
		return [q, r];
	},
	/** Modular remainder of an integer division.
	 * @param {BigInteger} n First operand
	 * @param {BigInteger} m Second operand
	 * @returns {BigInteger} n mod m
	 */
	mod: function(th, a) {
		var r = this.divRem(this.abs(th), a)[1];
		if (th.s < 0 && this.compareTo(r, this.create([0])) > 0) this.subTo(a, r, r);
		return r;
	},
	invDigit: function(th) {
		var a = th.array,
			x = a[0],
			y = x & 3;
		if (th.t < 1 || !(x & 1)) return 0;
		y = (y * (2 - (x & 0xf) * y)) & 0xf;
		y = (y * (2 - (x & 0xff) * y)) & 0xff;
		y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
		y = (y * (2 - x * y % this.BI_DV)) % this.BI_DV;
		return (y > 0) ? this.BI_DV - y : -y;
	},
	/** Extract a single bit from a BigInteger.
	 * @param {BigInteger} x value to extract bit from.
	 * @param {number} n index of the bit to return.
	 * @returns {number} 0 or 1.
	 */
	getBit: function(th, n) {
		var j = Math.floor(n / this.BI_DB)
		if (j >= th.t) {
			return (th.s != 0)
		}
		return (th.array[j] >> (n % this.BI_DB)) & 1
	},
	/** Modular exponentiation using Montgomery reduction. 
	 * @param {BigInteger} x Value to exponentiate
	 * @param {BigInteger} e Exponent
	 * @param {BigInteger} n Modulus - must be odd
	 * @returns {BigInteger} x^e mod n
	 */
	expMod: function(th, e, m) {
		var r = this.create([1]),
			r2 = this.create([0]),
			eb = e.array[(e.t - 1) & 255],
			g = this.Mconvert(th, m),
			i = this.bitLength(e) - 1,
			j = 0,
			t = r;
		if (this.compareTo(e, r) < 0) return r;
		this.copyTo(g, r);
		while (--i >= 0) {
			j = i % this.BI_DB;
			this.squareTo(r, r2);
			this.Mreduce(r2, m);
			if ((eb & (1 << j)) != 0) {
				this.multiplyTo(r2, g, r);
				this.Mreduce(r, m);
			} else {
				t = r;
				r = r2;
				r2 = t;
			}
			if (!j) eb = e.array[(i / this.BI_DB - 1) & 255];
		}
		return this.Mrevert(r, m);
	},
	Mconvert: function(th, m) {
		var s = this.create([0]),
			r = (this.DLshiftTo(this.abs(th), m.t, s), this.divRem(s, m))[1];
		if (th.s < 0 && this.compareTo(r, this.create([0])) > 0) this.subTo(m, r, r);
		return r;
	},
	Mreduce: function(th, m) {
		var mp = this.invDigit(m),
			mpl = mp & 0x7fff,
			mph = mp >> 15,
			a = th.array,
			um = (1 << (this.BI_DB - 15)) - 1,
			mt2 = 2 * m.t,
			i = 0,
			j = 0,
			u0 = 0;
		while (th.t <= mt2) a[th.t++ & 255] = 0;
		for (i = 0; i < m.t; ++i) {
			j = a[i & 255] & 0x7fff;
			u0 = (j * mpl + (((j * mph + (a[i & 255] >> 15) * mpl) & um) << 15)) &
				this.BI_DM;
			j = i + m.t;
			a[j & 255] += this.am(m, 0, u0, th, i, 0, m.t);
			while (a[j & 255] >= this.BI_DV) {
				a[j & 255] -= this.BI_DV;
				a[++j & 255]++;
			}
		}
		this.clamp(th);
		this.DRshiftTo(th, m.t, th);
		if (this.compareTo(th, m) >= 0) this.subTo(th, m, th);
		return th;
	},
	Mrevert: function(th, m) {
		var c = this.create([0]);
		this.copyTo(th, c);
		return this.Mreduce(c, m);
	},
	bitwiseTo: function(th, a, op, r) {
		var i, f, m = Math.min(a.t, th.t);
		for (i = 0; i < m; ++i) r.array[i] = op(th.array[i], a.array[i]);
		if (a.t < th.t) {
			f = a.s & this.BI_DM;
			for (i = m; i < th.t; ++i) r.array[i] = op(th.array[i], f);
			r.t = th.t;
		} else {
			f = th.s & this.BI_DM;
			for (i = m; i < a.t; ++i) r.array[i] = op(f, a.array[i]);
			r.t = a.t;
		}
		r.s = op(th.s, a.s);
		this.clamp(r);
	},
	lAnd: function(a, b) {
		var r = this.create([0x00]);
		var op_and = function(x, y) {
			return x & y;
		}
		this.bitwiseTo(b, a, op_and, r);
		return r;
	},
	changeBit: function(th, n, op) {
		var r = this.create([0x01]);
		var l = this.create([0x00]);
		this.LshiftTo(r, n, l);
		this.bitwiseTo(th, l, op, l);
		return l;
	},
	clearBit: function(th, n) {
		var op_andnot = function(x, y) {
			return x & ~y
		}
		return this.changeBit(th, n, op_andnot);
	},
	setBit: function(th, n) {
		var op_or = function(x, y) {
			return x | y
		}
		return this.changeBit(th, n, op_or);
	},
	flipHexString: function(s) {
		if (s.length % 2) {
			s = '0' + s
		}
		var r = '';
		var i = 0;
		for (i = s.length - 1; i > 0; i -= 2) {
			r += s[i - 1] + s[i]
		}
		return r
	},
	toFlippedString: function(th) {
		return this.flipHexString(this.toString(th));
	}
};
ProScript.crypto = {
	random12Bytes: function(s) {
		var u = new Uint8Array(12)
		window.crypto.getRandomValues(u)
		return [
			u[ 0], u[ 1], u[ 2], u[ 3],
			u[ 4], u[ 5], u[ 6], u[ 7],
			u[ 8], u[ 9], u[10], u[11],
		]
	},
	random16Bytes: function(s) {
		var u = new Uint8Array(16)
		window.crypto.getRandomValues(u)
		return [
			u[ 0], u[ 1], u[ 2], u[ 3],
			u[ 4], u[ 5], u[ 6], u[ 7],
			u[ 8], u[ 9], u[10], u[11],
			u[12], u[13], u[14], u[15]
		]
	},
	random32Bytes: function(s) {
		var u = new Uint8Array(32)
		window.crypto.getRandomValues(u)
		return [
			u[ 0], u[ 1], u[ 2], u[ 3],
			u[ 4], u[ 5], u[ 6], u[ 7],
			u[ 8], u[ 9], u[10], u[11],
			u[12], u[13], u[14], u[15],
			u[16], u[17], u[18], u[19],
			u[20], u[21], u[22], u[23],
			u[24], u[25], u[26], u[27],
			u[28], u[29], u[30], u[31],
		]
	},
	DH25519: (function() {
		var bI = ProScript.bigInteger;
		const p25519 = bI.create([
			0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xed
		])
		const p25519Minus2 = bI.create([
			0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xeb
		])
		var a = bI.create([0x07, 0x6d, 0x06])
		var two = bI.create([0x02])
		var four = bI.create([0x04])
		// groupAdd adds two elements of the elliptic curve group in Montgomery form.
		const groupAdd = function(x1, xn, zn, xm, zm) {
			var xx = bI.create([0x00])
			var zz = bI.create([0x00])
			var d = bI.create([0x00])
			var sq = bI.create([0x00])
			var outx = bI.create([0x00])
			var xz = bI.create([0x00])
			var zx = bI.create([0x00])
			var sq2 = bI.create([0x00])
			var outz = bI.create([0x00])
			// x₃ = 4(x·x′ - z·z′)² · z1
			bI.multiplyTo(xn, xm, xx)
			xx = bI.mod(xx, p25519)
			bI.multiplyTo(zn, zm, zz)
			zz = bI.mod(zz, p25519)
			if (bI.compareTo(xx, zz) > 0) {
				bI.subTo(xx, zz, d)
			}
			else {
				bI.subTo(zz, xx, d)
			}
			sq = bI.expMod(d, two, p25519)
			bI.multiplyTo(sq, four, outx)
			outx = bI.mod(outx, p25519)
			// z₃ = 4(x·z′ - z·x′)² · x1
			bI.multiplyTo(xm, zn, xz)
			xz = bI.mod(xz, p25519)
			bI.multiplyTo(zm, xn, zx)
			zx = bI.mod(zx, p25519)
			if (bI.compareTo(xz, zx) > 0) {
				bI.subTo(xz, zx, d)
			}
			else {
				bI.subTo(zx, xz, d)
			}
			sq = bI.expMod(d, two, p25519)
			bI.multiplyTo(sq, x1, sq2)
			sq2 = bI.mod(sq2, p25519)
			bI.multiplyTo(sq2, four, outz)
			outz = bI.mod(outz, p25519)
			return [outx, outz]
		}
		// groupDouble doubles a point in the elliptic curve group.
		const groupDouble = function(x, z) {
			var xx = bI.create([0x00])
			var zz = bI.create([0x00])
			var d = bI.create([0x00])
			var outx = bI.create([0x00])
			var s = bI.create([0x00])
			var xz = bI.create([0x00])
			var axz = bI.create([0x00])
			var fourxz = bI.create([0x00])
			var outz = bI.create([0x00])
			var saxz = bI.create([0x00])
			// x₂ = (x² - z²)²
			xx = bI.expMod(x, two, p25519)
			zz = bI.expMod(z, two, p25519)
			if (bI.compareTo(xx, zz) > 0) {
				bI.subTo(xx, zz, d)
			}
			else {
				bI.subTo(zz, xx, d)
			}
			outx = bI.expMod(d, two, p25519)
			// z₂ = 4xz·(x² + Axz + z²)
			bI.subTo(xx, bI.negate(zz), s)
			bI.multiplyTo(x, z, xz)
			xz = bI.mod(xz, p25519)
			bI.multiplyTo(xz, a, axz)
			bI.subTo(s, bI.negate(axz), saxz)
			bI.multiplyTo(xz, four, fourxz)
			bI.multiplyTo(fourxz, saxz, outz)
			outz = bI.mod(outz, p25519)
			return [outx, outz]
		}
		/** scalarMult calculates i*base in the elliptic curve.
		 * We can use it in order to generate a public key value,
		 * or to perform key agreement.
		 *
		 * @param   {byteArray} scalar - Private key, hexadecimal string
		 * @param   {byteArray} base - Base point (or public key), hexadecimal string
		 * @returns {byteArray} Public key or shared secret, hexadecimal string
		 */
		return function(scalar, base) {
			var x1 = bI.create([0x01])
			var z1 = bI.create([0x00])
			var x2 = bI.create(base)
			var z2 = bI.create([0x01])
			var point = [
				bI.create([0x00]),
				bI.create([0x00])
			]
			var i = 253
			var zlinv = bI.create([0x00])
			var x = bI.create([0x00])
			var s = bI.create(scalar)
			var b = bI.create(base)
			point = groupAdd(b, x1, z1, x2, z2)
			x1 = point[0]
			z1 = point[1]
			point = groupDouble(x2, z2)
			x2 = point[0]
			z2 = point[1]
			for (i = 253; i >= 3; i--) {
				if (bI.getBit(s, i) === 1) {
					point = groupAdd(b, x1, z1, x2, z2)
					x1 = point[0]
					z1 = point[1]
					point = groupDouble(x2, z2)
					x2 = point[0]
					z2 = point[1]
				}
				else {
					point = groupAdd(b, x1, z1, x2, z2)
					x2 = point[0]
					z2 = point[1]
					point = groupDouble(x1, z1)
					x1 = point[0]
					z1 = point[1]
				}
			}
			// Lowest 3 bits are zero
			for (i = 2; i >= 0; i--) {
				point = groupDouble(x1, z1)
				x1 = point[0]
				z1 = point[1]
			}
			z1inv = bI.expMod(z1, p25519Minus2, p25519)
			bI.multiplyTo(z1inv, x1, x)
			x = bI.toString(bI.mod(x, p25519))
			while (x.length < 64) { x = '0' + x }
			return [
				+('0x' + (x[ 0] + x[ 1])), +('0x' + (x[ 2] + x[ 3])),
				+('0x' + (x[ 4] + x[ 5])), +('0x' + (x[ 6] + x[ 7])),
				+('0x' + (x[ 8] + x[ 9])), +('0x' + (x[10] + x[11])),
				+('0x' + (x[12] + x[13])), +('0x' + (x[14] + x[15])),
				+('0x' + (x[16] + x[17])), +('0x' + (x[18] + x[19])),
				+('0x' + (x[20] + x[21])), +('0x' + (x[22] + x[23])),
				+('0x' + (x[24] + x[25])), +('0x' + (x[26] + x[27])),
				+('0x' + (x[28] + x[29])), +('0x' + (x[30] + x[31])),
				+('0x' + (x[32] + x[33])), +('0x' + (x[34] + x[35])),
				+('0x' + (x[36] + x[37])), +('0x' + (x[38] + x[39])),
				+('0x' + (x[40] + x[41])), +('0x' + (x[42] + x[43])),
				+('0x' + (x[44] + x[45])), +('0x' + (x[46] + x[47])),
				+('0x' + (x[48] + x[49])), +('0x' + (x[50] + x[51])),
				+('0x' + (x[52] + x[53])), +('0x' + (x[54] + x[55])),
				+('0x' + (x[56] + x[57])), +('0x' + (x[58] + x[59])),
				+('0x' + (x[60] + x[61])), +('0x' + (x[62] + x[63]))
			]
		}
	})(),
	AESGCMEncrypt: function(k, iv, m, aad) {
		var aes = NodeCrypto.createCipheriv(
			'aes-256-gcm', new Buffer(k), new Buffer(iv)
		);
		var res = {
			ciphertext: '',
			tag: ''
		};
		aes.setAAD(new Buffer(aad, 'hex'));
		res.ciphertext += aes.update(m, 'utf8').toString('hex');
		res.ciphertext += aes.final().toString('hex');
		res.tag        += aes.getAuthTag().toString('hex');
		return res;
	},
	AESGCMDecrypt: function(k, iv, m, aad) {
		var aes = NodeCrypto.createDecipheriv(
			'aes-256-gcm', new Buffer(k), new Buffer(iv)
		);
		var res = '';
		aes.setAAD(new Buffer(aad, 'hex'));
		aes.setAuthTag(new Buffer(m.tag, 'hex'));
		res += aes.update(m.ciphertext, 'hex').toString('utf8');
		try {
			res += aes.final().toString('utf8');
			return {
				plaintext: res,
				valid: true
			};
		} catch (e) {
			return {
				plaintext: '',
				valid: false
			};
		};
	},
	SHA256: function(m) {
		var s = NodeCrypto.createHash('sha256');
		return s.update(m, 'hex').digest('hex');
	},
	SHA512: function(m) {
		var s = NodeCrypto.createHash('sha512');
		return s.update(m, 'hex').digest('hex');
	},
	HMACSHA256: function(k, m) {
		var hmac = NodeCrypto.createHmac(
			'sha256', new Buffer(k)
		);
		hmac.update(m, 'utf8');
		return ProScript.encoding.hexStringTo32ByteArray(
			hmac.digest('hex')
		);
	},
	checkHMACSHA256: function(k, m, h) {
		const a = ProScript.encoding.hexStringTo32ByteArray(h);
		const b = ProScript.encoding.hexStringTo32ByteArray(
			ProScript.crypto.HMACSHA256(k, m)
		);
		const r = (
			(a[ 0] ^ b[ 0]) + (a[16] ^ b[16]) +
			(a[ 1] ^ b[ 1]) + (a[17] ^ b[17]) +
			(a[ 2] ^ b[ 2]) + (a[18] ^ b[18]) +
			(a[ 3] ^ b[ 3]) + (a[19] ^ b[19]) +
			(a[ 4] ^ b[ 4]) + (a[20] ^ b[20]) +
			(a[ 5] ^ b[ 5]) + (a[21] ^ b[21]) +
			(a[ 6] ^ b[ 6]) + (a[22] ^ b[22]) +
			(a[ 7] ^ b[ 7]) + (a[23] ^ b[23]) +
			(a[ 8] ^ b[ 8]) + (a[24] ^ b[24]) +
			(a[ 9] ^ b[ 9]) + (a[25] ^ b[25]) +
			(a[10] ^ b[10]) + (a[26] ^ b[26]) +
			(a[11] ^ b[11]) + (a[27] ^ b[27]) +
			(a[12] ^ b[12]) + (a[28] ^ b[28]) +
			(a[13] ^ b[13]) + (a[29] ^ b[29]) +
			(a[14] ^ b[14]) + (a[30] ^ b[30]) +
			(a[15] ^ b[15]) + (a[31] ^ b[31])
		)
		return (r === 0)
	},
	ED25519Hash: function(a) {
		var s = NodeCrypto.createHash('sha512');
		return s.update((new Buffer(a, 'hex'))).digest('hex');
	}
};
ProScript.crypto.ED25519 = (function(m) {
	var bI = ProScript.bigInteger;
	var p25519 = bI.create([
		0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xed
	]);
	var p25519S1 = bI.create([
		0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xec
	]);
	var p25519S2 = bI.create([
		0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xeb
	]);
	var p25519P3D8 = bI.create([
		0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe
	]);
	var l = bI.create([
		0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x14, 0xde, 0xf9, 0xde, 0xa2, 0xf7, 0x9c, 0xd6,
		0x58, 0x12, 0x63, 0x1a, 0x5c, 0xf5, 0xd3, 0xed
	]);
	var d = bI.negate(bI.create([
		0x98, 0x41, 0x2d, 0xfc, 0x93, 0x11, 0xd4, 0x90,
		0x01, 0x8c, 0x73, 0x38, 0xbf, 0x86, 0x88, 0x86,
		0x17, 0x67, 0xff, 0x8f, 0xf5, 0xb2, 0xbe, 0xbe,
		0x27, 0x54, 0x8a, 0x14, 0xb2, 0x35, 0xec, 0x8f,
		0xed, 0xa4
	]));
	var i = bI.create([
		0x2b, 0x83, 0x24, 0x80, 0x4f, 0xc1, 0xdf, 0x0b,
		0x2b, 0x4d, 0x00, 0x99, 0x3d, 0xfb, 0xd7, 0xa7,
		0x2f, 0x43, 0x18, 0x06, 0xad, 0x2f, 0xe4, 0x78,
		0xc4, 0xee, 0x1b, 0x27, 0x4a, 0x0e, 0xa0, 0xb0
	]);
	var b = [
		bI.create([
			0x21, 0x69, 0x36, 0xd3, 0xcd, 0x6e, 0x53, 0xfe,
			0xc0, 0xA4, 0xE2, 0x31, 0xfd, 0xd6, 0xdc, 0x5c,
			0x69, 0x2c, 0xc7, 0x60, 0x95, 0x25, 0xa7, 0xb2,
			0xc9, 0x56, 0x2d, 0x60, 0x8F, 0x25, 0xd5, 0x1a
		]),
		bI.create([
			0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66,
			0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66,
			0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66,
			0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x58
		])
	];
	var inv = function(x) {
		return bI.expMod(x, p25519S2, p25519);
	};
	var xRecover = function(y) {
		var xx = bI.create([0x00]);
		var yTy = bI.create([0x00]);
		var yTyS1 = bI.create([0x00]);
		var dTyTy = bI.create([0x00]);
		var dTyTyP1 = bI.create([0x00]);
		var x = bI.create([0x00]);
		var xTx = bI.create([0x00]);
		var xTxSxx = bI.create([0x00]);
		var xTxSxxMp25519 = bI.create([0x00]);
		var res = bI.create([0x00]);
		bI.squareTo(y, yTy);
		bI.subTo(yTy, bI.create([0x01]), yTyS1);
		bI.multiplyTo(d, yTy, dTyTy);
		bI.subTo(dTyTy, bI.negate(bI.create([0x01])), dTyTyP1);
		bI.multiplyTo(yTyS1, inv(dTyTyP1), xx);
		x = bI.expMod(xx, p25519P3D8, p25519);
		bI.squareTo(x, xTx);
		bI.subTo(xTx, xx, xTxSxx);
		xTxSxxMp25519 = bI.mod(xTxSxx, p25519);
		if (bI.compareTo(xTxSxxMp25519, bI.create([0x00])) !== 0) {
			bI.multiplyTo(x, i, res);
			res = bI.mod(res, p25519);
		} else {
			bI.copyTo(x, res)
		}
		if (bI.compareTo(bI.mod(res, bI.create([0x02])), bI.create([0x00])) !== 0) {
			bI.subTo(p25519, res, res);
		}
		return res
	};
	var edwards = function(p, q) {
		var x1Ty2 = bI.create([0x00]);
		var x2Ty1 = bI.create([0x00]);
		var y1Ty2 = bI.create([0x00]);
		var x1Tx2 = bI.create([0x00]);
		var x1Ty2Px2Ty1 = bI.create([0x00]);
		var y1Ty2Px1Tx2 = bI.create([0x00]);
		var x1Tx2Ty1Ty2 = bI.create([0x00]);
		var dTx1Tx2Ty1Ty2 = bI.create([0x00]);
		var PdTx1Tx2Ty1Ty2 = bI.create([0x00]);
		var SdTx1Tx2Ty1Ty2 = bI.create([0x00]);
		var x3 = bI.create([0x00]);
		var y3 = bI.create([0x00]);
		bI.multiplyTo(p[0], q[1], x1Ty2);
		bI.multiplyTo(q[0], p[1], x2Ty1);
		bI.multiplyTo(p[1], q[1], y1Ty2);
		bI.multiplyTo(p[0], q[0], x1Tx2);
		bI.subTo(x1Ty2, bI.negate(x2Ty1), x1Ty2Px2Ty1);
		bI.subTo(y1Ty2, bI.negate(x1Tx2), y1Ty2Px1Tx2);
		bI.multiplyTo(x1Tx2, y1Ty2, x1Tx2Ty1Ty2);
		bI.multiplyTo(d, x1Tx2Ty1Ty2, dTx1Tx2Ty1Ty2);
		bI.subTo(bI.create([0x01]), bI.negate(dTx1Tx2Ty1Ty2), PdTx1Tx2Ty1Ty2);
		bI.subTo(bI.create([0x01]), dTx1Tx2Ty1Ty2, SdTx1Tx2Ty1Ty2);
		bI.multiplyTo(x1Ty2Px2Ty1, inv(PdTx1Tx2Ty1Ty2), x3);
		bI.multiplyTo(y1Ty2Px1Tx2, inv(SdTx1Tx2Ty1Ty2), y3);
		return [
			bI.mod(x3, p25519),
			bI.mod(y3, p25519)
		]
	};
	var scalarMult = function(p, e) {
		var res = [bI.create([0x00]), bI.create([0x01])];
		var q = bI.create([0x00]);
		if (bI.compareTo(e, bI.create([0x00])) === 0) {
			return res;
		};
		q = scalarMult(p, bI.divRem(e, bI.create([0x02]))[0]);
		q = edwards(q, q);
		if (bI.compareTo(
			bI.lAnd(e, bI.create([0x01])),
			bI.create([0x01])
		) === 0) {
			q = edwards(q, p)
		}
		return q;
	};
	var isOnCurve = function(p) {
		var xTx                  = bI.create([0x4e]);
		var yTy                  = bI.create([0x61]);
		var xTxTyTy              = bI.create([0x64]);
		var dTxTxTyTy            = bI.create([0x6a]);
		var SxTxPyTy             = bI.create([0x61]);
		var SxTxPyTyS1           = bI.create([0x00]);
		var SxTxPyTyS1SdTxTxTyTy = bI.create([0x00]);
		bI.squareTo(p[0], xTx);
		bI.squareTo(p[1], yTy);
		bI.multiplyTo(xTx, yTy, xTxTyTy);
		bI.multiplyTo(d, xTxTyTy, dTxTxTyTy);
		bI.subTo(bI.negate(xTx), bI.negate(yTy), SxTxPyTy);
		bI.subTo(SxTxPyTy, bI.create([0x01]), SxTxPyTyS1);
		bI.subTo(SxTxPyTyS1, dTxTxTyTy, SxTxPyTyS1SdTxTxTyTy);
		return (bI.compareTo(
			bI.mod(SxTxPyTyS1SdTxTxTyTy, p25519),
			bI.create([0x00])
		) === 0)
	};
	var encodePoint = function(p) {
		var e  = bI.create([0x00]);
		var _p = bI.toString(p[1]);
		var s  = ''
		e = bI.createFromString(_p);
		if (bI.getBit(p[0], 0) === 1) {
			e = bI.setBit(e, 255);
		}
		s = bI.toFlippedString(e);
		while (s.length < 64) {
			s += '0';
		}
		return s;
	};
	var decodePoint = function(s) {
		var y = bI.createFromString(bI.flipHexString(s));
		var c = bI.clearBit(y, 255);
		var x = xRecover(c);
		if (bI.compareTo(
			bI.lAnd(x,  bI.create([0x01])),
			bI.create([bI.getBit(y, 255)])
		) !== 0) {
			bI.subTo(p25519, x, x);
		}
		return {
			p: [x, c],
			valid: isOnCurve([x, c])
		}
	};
	var tBits = function(h) {
		var a = bI.create([
			0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
		]);
		var y = bI.createFromString(bI.flipHexString(
			h.substr(0, 64)
		));
		y = bI.clearBit(y, 0);
		y = bI.clearBit(y, 1);
		y = bI.clearBit(y, 2);
		y = bI.clearBit(y, 254);
		y = bI.clearBit(y, 255);
		bI.subTo(a, bI.negate(y), a);
		return a;
	};
	var hInt = function(m) {
		var h = ProScript.crypto.ED25519Hash(m);
		return bI.createFromString(bI.flipHexString(
			h
		));
	};
	var publicKey = function(sk) {
		var h = ProScript.crypto.ED25519Hash(sk);
		var x = encodePoint(scalarMult(b, tBits(h)));
		return ProScript.encoding.hexStringTo32ByteArray(x);
	};
	var signature = function(m, sk, pk) {
		var pks = ProScript.encoding.byteArrayToHexString(pk);
		var h   = ProScript.crypto.ED25519Hash(sk);
		var a   = tBits(h);
		var _r  = '';
		var r   = 0;
		var o   = 0;
		var p   = '';
		var s   = bI.create([0x00]);
		for (o = 64; o < 128; o++) {
			_r += h[o];
		}
		r = hInt(_r + m);
		p = encodePoint(scalarMult(b, r));
		bI.multiplyTo(hInt(p + pks + m), a, s);
		bI.subTo(r, bI.negate(s), s);
		s = bI.mod(s, l);
		p += bI.toFlippedString(s);
		while (p.length < 128) {
			p += '0';
		}
		return p;
	};
	var checkValid = function(s, m, pk) {
		var pks = ProScript.encoding.byteArrayToHexString(pk);
		var valid = false;
		var r =  [bI.create([0x00]), bI.create([0x00])];
		var t =  [bI.create([0x00]), bI.create([0x00])];
		var na = [bI.create([0x00]), bI.create([0x00])];
		var nb = [bI.create([0x00]), bI.create([0x00])];
		var _r = '';
		var _t = '';
		var a  = decodePoint(pks);
		var o  = 0;
		for (o = 0; o < 64; o++) {
			_r += s[o];
		}
		for (o = 64; o < 128; o++) {
			_t += s[o]
		}
		r = decodePoint(_r);
		t = bI.createFromString(bI.flipHexString(_t));
		na = scalarMult(b, t);
		nb = edwards(r.p, scalarMult(a.p, hInt(_r + pks + m)));
		if (
			(pks.length ===  64)               &&
			(s.length   === 128)               &&
			(r.valid && a.valid)               &&
			(bI.compareTo(na[0], nb[0]) === 0) && 
			(bI.compareTo(na[1], nb[1]) === 0)
		) {
			valid = true;
		}
		return valid;
	};
	return {
		publicKey: publicKey,
		signature: signature,
		checkValid: checkValid
	};
})()
