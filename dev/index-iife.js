
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
     * Base-N/Base-X encoding/decoding functions.
     *
     * Original implementation from base-x:
     * https://github.com/cryptocoinjs/base-x
     *
     * Which is MIT licensed:
     *
     * The MIT License (MIT)
     *
     * Copyright base-x contributors (c) 2016
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     * DEALINGS IN THE SOFTWARE.
     */

    // baseN alphabet indexes
    const _reverseAlphabets = {};

    /**
     * BaseN-encodes a Uint8Array using the given alphabet.
     *
     * @param {Uint8Array} input the bytes to encode in a Uint8Array.
     * @param {number} maxline the maximum number of encoded characters per line to
     *          use, defaults to none.
     *
     * @return {string} the baseN-encoded output string.
     */
    function encode$1(input, alphabet, maxline) {
      if(!(input instanceof Uint8Array)) {
        throw new TypeError('"input" must be a Uint8Array.');
      }
      if(typeof alphabet !== 'string') {
        throw new TypeError('"alphabet" must be a string.');
      }
      if(maxline !== undefined && typeof maxline !== 'number') {
        throw new TypeError('"maxline" must be a number.');
      }
      if(input.length === 0) {
        return '';
      }

      let output = '';

      let i = 0;
      const base = alphabet.length;
      const first = alphabet.charAt(0);
      const digits = [0];
      for(i = 0; i < input.length; ++i) {
        let carry = input[i];
        for(let j = 0; j < digits.length; ++j) {
          carry += digits[j] << 8;
          digits[j] = carry % base;
          carry = (carry / base) | 0;
        }

        while(carry > 0) {
          digits.push(carry % base);
          carry = (carry / base) | 0;
        }
      }

      // deal with leading zeros
      for(i = 0; input[i] === 0 && i < input.length - 1; ++i) {
        output += first;
      }
      // convert digits to a string
      for(i = digits.length - 1; i >= 0; --i) {
        output += alphabet[digits[i]];
      }

      if(maxline) {
        const regex = new RegExp('.{1,' + maxline + '}', 'g');
        output = output.match(regex).join('\r\n');
      }

      return output;
    }

    /**
     * Decodes a baseN-encoded (using the given alphabet) string to a
     * Uint8Array.
     *
     * @param {string} input the baseN-encoded input string.
     *
     * @return {Uint8Array} the decoded bytes in a Uint8Array.
     */
    function decode$1(input, alphabet) {
      if(typeof input !== 'string') {
        throw new TypeError('"input" must be a string.');
      }
      if(typeof alphabet !== 'string') {
        throw new TypeError('"alphabet" must be a string.');
      }
      if(input.length === 0) {
        return new Uint8Array();
      }

      let table = _reverseAlphabets[alphabet];
      if(!table) {
        // compute reverse alphabet
        table = _reverseAlphabets[alphabet] = [];
        for(let i = 0; i < alphabet.length; ++i) {
          table[alphabet.charCodeAt(i)] = i;
        }
      }

      // remove whitespace characters
      input = input.replace(/\s/g, '');

      const base = alphabet.length;
      const first = alphabet.charAt(0);
      const bytes = [0];
      for(let i = 0; i < input.length; i++) {
        const value = table[input.charCodeAt(i)];
        if(value === undefined) {
          return;
        }

        let carry = value;
        for(let j = 0; j < bytes.length; ++j) {
          carry += bytes[j] * base;
          bytes[j] = carry & 0xff;
          carry >>= 8;
        }

        while(carry > 0) {
          bytes.push(carry & 0xff);
          carry >>= 8;
        }
      }

      // deal with leading zeros
      for(let k = 0; input[k] === first && k < input.length - 1; ++k) {
        bytes.push(0);
      }

      return new Uint8Array(bytes.reverse());
    }

    /*!
     * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
     */

    // base58 characters (Bitcoin alphabet)
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

    function encode(input, maxline) {
      return encode$1(input, alphabet, maxline);
    }

    function decode(input) {
      return decode$1(input, alphabet);
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
    var inited = false;
    function init$1 () {
      inited = true;
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;
    }

    function toByteArray (b64) {
      if (!inited) {
        init$1();
      }
      var i, j, l, tmp, placeHolders, arr;
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders);

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len;

      var L = 0;

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
        arr[L++] = (tmp >> 16) & 0xFF;
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[L++] = tmp & 0xFF;
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[L++] = (tmp >> 8) & 0xFF;
        arr[L++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      if (!inited) {
        init$1();
      }
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var output = '';
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[(tmp << 4) & 0x3F];
        output += '==';
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
        output += lookup[tmp >> 10];
        output += lookup[(tmp >> 4) & 0x3F];
        output += lookup[(tmp << 2) & 0x3F];
        output += '=';
      }

      parts.push(output);

      return parts.join('')
    }

    function read (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    function write (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    }

    var toString = {}.toString;

    var isArray = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };

    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */

    var INSPECT_MAX_BYTES = 50;

    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.

     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer$3.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
      ? global$1.TYPED_ARRAY_SUPPORT
      : true;

    /*
     * Export kMaxLength after typed array support is determined.
     */
    var _kMaxLength = kMaxLength();

    function kMaxLength () {
      return Buffer$3.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }

    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length);
        that.__proto__ = Buffer$3.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer$3(length);
        }
        that.length = length;
      }

      return that
    }

    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */

    function Buffer$3 (arg, encodingOrOffset, length) {
      if (!Buffer$3.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$3)) {
        return new Buffer$3(arg, encodingOrOffset, length)
      }

      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }

    Buffer$3.poolSize = 8192; // not used by this implementation

    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer$3._augment = function (arr) {
      arr.__proto__ = Buffer$3.prototype;
      return arr
    };

    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }

      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }

      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }

      return fromObject(that, value)
    }

    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer$3.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    };

    if (Buffer$3.TYPED_ARRAY_SUPPORT) {
      Buffer$3.prototype.__proto__ = Uint8Array.prototype;
      Buffer$3.__proto__ = Uint8Array;
    }

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }

    function alloc (that, size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }

    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer$3.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    };

    function allocUnsafe (that, size) {
      assertSize(size);
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
      if (!Buffer$3.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0;
        }
      }
      return that
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer$3.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer$3.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    };

    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer$3.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }

      var length = byteLength(string, encoding) | 0;
      that = createBuffer(that, length);

      var actual = that.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual);
      }

      return that
    }

    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      that = createBuffer(that, length);
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255;
      }
      return that
    }

    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength; // this throws if `array` is not a valid ArrayBuffer

      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }

      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array);
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset);
      } else {
        array = new Uint8Array(array, byteOffset, length);
      }

      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array;
        that.__proto__ = Buffer$3.prototype;
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array);
      }
      return that
    }

    function fromObject (that, obj) {
      if (internalIsBuffer(obj)) {
        var len = checked(obj.length) | 0;
        that = createBuffer(that, len);

        if (that.length === 0) {
          return that
        }

        obj.copy(that, 0, 0, len);
        return that
      }

      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }

        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }

      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }

    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }

    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0;
      }
      return Buffer$3.alloc(+length)
    }
    Buffer$3.isBuffer = isBuffer;
    function internalIsBuffer (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer$3.compare = function compare (a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    Buffer$3.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    };

    Buffer$3.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer$3.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer$3.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (internalIsBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string;
      }

      var len = string.length;
      if (len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer$3.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)

          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)

          case 'ascii':
            return asciiSlice(this, start, end)

          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)

          case 'base64':
            return base64Slice(this, start, end)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer$3.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer$3.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer$3.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer$3.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer$3.prototype.toString = function toString () {
      var length = this.length | 0;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer$3.prototype.equals = function equals (b) {
      if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer$3.compare(this, b) === 0
    };

    Buffer$3.prototype.inspect = function inspect () {
      var str = '';
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
        if (this.length > max) str += ' ... ';
      }
      return '<Buffer ' + str + '>'
    };

    Buffer$3.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
      }

      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }

      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1

      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset;  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer$3.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (internalIsBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (Buffer$3.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break
            }
          }
          if (found) return i
        }
      }

      return -1
    }

    Buffer$3.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    };

    Buffer$3.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer$3.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      // must be an even number of digits
      var strLen = string.length;
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }

    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }

    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }

    Buffer$3.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
            return asciiWrite(this, string, offset, length)

          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)

          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)

          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)

          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer$3.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return fromByteArray(buf)
      } else {
        return fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += toHex$1(buf[i]);
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res
    }

    Buffer$3.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf;
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer$3.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer$3(sliceLen, undefined);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer$3.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer$3.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer$3.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer$3.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer$3.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer$3.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer$3.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer$3.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer$3.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer$3.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer$3.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer$3.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer$3.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer$3.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer$3.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4)
    };

    Buffer$3.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4)
    };

    Buffer$3.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8)
    };

    Buffer$3.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer$3.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer$3.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength = byteLength | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer$3.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      if (!Buffer$3.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8;
      }
    }

    Buffer$3.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer$3.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1;
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
      }
    }

    Buffer$3.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24);
        this[offset + 2] = (value >>> 16);
        this[offset + 1] = (value >>> 8);
        this[offset] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer$3.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    Buffer$3.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer$3.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer$3.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (!Buffer$3.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer$3.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2
    };

    Buffer$3.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8);
        this[offset + 1] = (value & 0xff);
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2
    };

    Buffer$3.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff);
        this[offset + 1] = (value >>> 8);
        this[offset + 2] = (value >>> 16);
        this[offset + 3] = (value >>> 24);
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4
    };

    Buffer$3.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      if (Buffer$3.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24);
        this[offset + 1] = (value >>> 16);
        this[offset + 2] = (value >>> 8);
        this[offset + 3] = (value & 0xff);
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer$3.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer$3.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer$3.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer$3.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer$3.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;
      var i;

      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1000 || !Buffer$3.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer$3.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer$3.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val)
          ? val
          : utf8ToBytes(new Buffer$3(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function toHex$1 (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }


    function base64ToBytes (str) {
      return toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }


    // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
    // The _isBuffer check is for Safari 5-7 support, because it's missing
    // Object.prototype.constructor. Remove this eventually
    function isBuffer(obj) {
      return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
    }

    function isFastBuffer (obj) {
      return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    }

    // For Node v0.10 support. Remove this eventually.
    function isSlowBuffer (obj) {
      return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
    }

    var _polyfillNode_buffer = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Buffer: Buffer$3,
        INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
        SlowBuffer: SlowBuffer,
        isBuffer: isBuffer,
        kMaxLength: _kMaxLength
    });

    const ERROR_MSG_INPUT = 'Input must be an string, Buffer or Uint8Array';

    // For convenience, let people hash a string, not just a Uint8Array
    function normalizeInput (input) {
      let ret;
      if (input instanceof Uint8Array) {
        ret = input;
      } else if (input instanceof Buffer$3) {
        ret = new Uint8Array(input);
      } else if (typeof input === 'string') {
        ret = new Uint8Array(Buffer$3.from(input, 'utf8'));
      } else {
        throw new Error(ERROR_MSG_INPUT)
      }
      return ret
    }

    // Converts a Uint8Array to a hexadecimal string
    // For example, toHex([255, 0, 255]) returns "ff00ff"
    function toHex (bytes) {
      return Array.prototype.map
        .call(bytes, function (n) {
          return (n < 16 ? '0' : '') + n.toString(16)
        })
        .join('')
    }

    // Converts any value in [0...2^32-1] to an 8-character hex string
    function uint32ToHex (val) {
      return (0x100000000 + val).toString(16).substring(1)
    }

    // For debugging: prints out hash state in the same format as the RFC
    // sample computation exactly, so that you can diff
    function debugPrint (label, arr, size) {
      let msg = '\n' + label + ' = ';
      for (let i = 0; i < arr.length; i += 2) {
        if (size === 32) {
          msg += uint32ToHex(arr[i]).toUpperCase();
          msg += ' ';
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
        } else if (size === 64) {
          msg += uint32ToHex(arr[i + 1]).toUpperCase();
          msg += uint32ToHex(arr[i]).toUpperCase();
        } else throw new Error('Invalid size ' + size)
        if (i % 6 === 4) {
          msg += '\n' + new Array(label.length + 4).join(' ');
        } else if (i < arr.length - 2) {
          msg += ' ';
        }
      }
      console.log(msg);
    }

    // For performance testing: generates N bytes of input, hashes M times
    // Measures and prints MB/second hash performance each time
    function testSpeed (hashFn, N, M) {
      let startMs = new Date().getTime();

      const input = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        input[i] = i % 256;
      }
      const genMs = new Date().getTime();
      console.log('Generated random input in ' + (genMs - startMs) + 'ms');
      startMs = genMs;

      for (let i = 0; i < M; i++) {
        const hashHex = hashFn(input);
        const hashMs = new Date().getTime();
        const ms = hashMs - startMs;
        startMs = hashMs;
        console.log('Hashed in ' + ms + 'ms: ' + hashHex.substring(0, 20) + '...');
        console.log(
          Math.round((N / (1 << 20) / (ms / 1000)) * 100) / 100 + ' MB PER SECOND'
        );
      }
    }

    var util$2 = {
      normalizeInput: normalizeInput,
      toHex: toHex,
      debugPrint: debugPrint,
      testSpeed: testSpeed
    };

    // Blake2B in pure Javascript
    // Adapted from the reference implementation in RFC7693
    // Ported to Javascript by DC - https://github.com/dcposch

    const util$1 = util$2;

    // 64-bit unsigned addition
    // Sets v[a,a+1] += v[b,b+1]
    // v should be a Uint32Array
    function ADD64AA (v, a, b) {
      const o0 = v[a] + v[b];
      let o1 = v[a + 1] + v[b + 1];
      if (o0 >= 0x100000000) {
        o1++;
      }
      v[a] = o0;
      v[a + 1] = o1;
    }

    // 64-bit unsigned addition
    // Sets v[a,a+1] += b
    // b0 is the low 32 bits of b, b1 represents the high 32 bits
    function ADD64AC (v, a, b0, b1) {
      let o0 = v[a] + b0;
      if (b0 < 0) {
        o0 += 0x100000000;
      }
      let o1 = v[a + 1] + b1;
      if (o0 >= 0x100000000) {
        o1++;
      }
      v[a] = o0;
      v[a + 1] = o1;
    }

    // Little-endian byte access
    function B2B_GET32 (arr, i) {
      return arr[i] ^ (arr[i + 1] << 8) ^ (arr[i + 2] << 16) ^ (arr[i + 3] << 24)
    }

    // G Mixing function
    // The ROTRs are inlined for speed
    function B2B_G (a, b, c, d, ix, iy) {
      const x0 = m$1[ix];
      const x1 = m$1[ix + 1];
      const y0 = m$1[iy];
      const y1 = m$1[iy + 1];

      ADD64AA(v$1, a, b); // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
      ADD64AC(v$1, a, x0, x1); // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

      // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
      let xor0 = v$1[d] ^ v$1[a];
      let xor1 = v$1[d + 1] ^ v$1[a + 1];
      v$1[d] = xor1;
      v$1[d + 1] = xor0;

      ADD64AA(v$1, c, d);

      // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
      xor0 = v$1[b] ^ v$1[c];
      xor1 = v$1[b + 1] ^ v$1[c + 1];
      v$1[b] = (xor0 >>> 24) ^ (xor1 << 8);
      v$1[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

      ADD64AA(v$1, a, b);
      ADD64AC(v$1, a, y0, y1);

      // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
      xor0 = v$1[d] ^ v$1[a];
      xor1 = v$1[d + 1] ^ v$1[a + 1];
      v$1[d] = (xor0 >>> 16) ^ (xor1 << 16);
      v$1[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

      ADD64AA(v$1, c, d);

      // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
      xor0 = v$1[b] ^ v$1[c];
      xor1 = v$1[b + 1] ^ v$1[c + 1];
      v$1[b] = (xor1 >>> 31) ^ (xor0 << 1);
      v$1[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
    }

    // Initialization Vector
    const BLAKE2B_IV32 = new Uint32Array([
      0xf3bcc908,
      0x6a09e667,
      0x84caa73b,
      0xbb67ae85,
      0xfe94f82b,
      0x3c6ef372,
      0x5f1d36f1,
      0xa54ff53a,
      0xade682d1,
      0x510e527f,
      0x2b3e6c1f,
      0x9b05688c,
      0xfb41bd6b,
      0x1f83d9ab,
      0x137e2179,
      0x5be0cd19
    ]);

    const SIGMA8 = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3
    ];

    // These are offsets into a uint64 buffer.
    // Multiply them all by 2 to make them offsets into a uint32 buffer,
    // because this is Javascript and we don't have uint64s
    const SIGMA82 = new Uint8Array(
      SIGMA8.map(function (x) {
        return x * 2
      })
    );

    // Compression function. 'last' flag indicates last block.
    // Note we're representing 16 uint64s as 32 uint32s
    const v$1 = new Uint32Array(32);
    const m$1 = new Uint32Array(32);
    function blake2bCompress (ctx, last) {
      let i = 0;

      // init work variables
      for (i = 0; i < 16; i++) {
        v$1[i] = ctx.h[i];
        v$1[i + 16] = BLAKE2B_IV32[i];
      }

      // low 64 bits of offset
      v$1[24] = v$1[24] ^ ctx.t;
      v$1[25] = v$1[25] ^ (ctx.t / 0x100000000);
      // high 64 bits not supported, offset may not be higher than 2**53-1

      // last block flag set ?
      if (last) {
        v$1[28] = ~v$1[28];
        v$1[29] = ~v$1[29];
      }

      // get little-endian words
      for (i = 0; i < 32; i++) {
        m$1[i] = B2B_GET32(ctx.b, 4 * i);
      }

      // twelve rounds of mixing
      // uncomment the DebugPrint calls to log the computation
      // and match the RFC sample documentation
      // util.debugPrint('          m[16]', m, 64)
      for (i = 0; i < 12; i++) {
        // util.debugPrint('   (i=' + (i < 10 ? ' ' : '') + i + ') v[16]', v, 64)
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
      }
      // util.debugPrint('   (i=12) v[16]', v, 64)

      for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v$1[i] ^ v$1[i + 16];
      }
      // util.debugPrint('h[8]', ctx.h, 64)
    }

    // Creates a BLAKE2b hashing context
    // Requires an output length between 1 and 64 bytes
    // Takes an optional Uint8Array key
    function blake2bInit (outlen, key) {
      if (outlen === 0 || outlen > 64) {
        throw new Error('Illegal output length, expected 0 < length <= 64')
      }
      if (key && key.length > 64) {
        throw new Error('Illegal key, expected Uint8Array with 0 < length <= 64')
      }

      // state, 'param block'
      const ctx = {
        b: new Uint8Array(128),
        h: new Uint32Array(16),
        t: 0, // input count
        c: 0, // pointer within buffer
        outlen: outlen // output length in bytes
      };

      // initialize hash state
      for (let i = 0; i < 16; i++) {
        ctx.h[i] = BLAKE2B_IV32[i];
      }
      const keylen = key ? key.length : 0;
      ctx.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen;

      // key the hash, if applicable
      if (key) {
        blake2bUpdate(ctx, key);
        // at the end
        ctx.c = 128;
      }

      return ctx
    }

    // Updates a BLAKE2b streaming hash
    // Requires hash context and Uint8Array (byte array)
    function blake2bUpdate (ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 128) {
          // buffer full ?
          ctx.t += ctx.c; // add counters
          blake2bCompress(ctx, false); // compress (not last)
          ctx.c = 0; // counter to zero
        }
        ctx.b[ctx.c++] = input[i];
      }
    }

    // Completes a BLAKE2b streaming hash
    // Returns a Uint8Array containing the message digest
    function blake2bFinal (ctx) {
      ctx.t += ctx.c; // mark last block offset

      while (ctx.c < 128) {
        // fill up with zeros
        ctx.b[ctx.c++] = 0;
      }
      blake2bCompress(ctx, true); // final block flag = 1

      // little endian convert and store
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> (8 * (i & 3));
      }
      return out
    }

    // Computes the BLAKE2B hash of a string or byte array, and returns a Uint8Array
    //
    // Returns a n-byte Uint8Array
    //
    // Parameters:
    // - input - the input bytes, as a string, Buffer or Uint8Array
    // - key - optional key Uint8Array, up to 64 bytes
    // - outlen - optional output length in bytes, default 64
    function blake2b (input, key, outlen) {
      // preprocess inputs
      outlen = outlen || 64;
      input = util$1.normalizeInput(input);

      // do the math
      const ctx = blake2bInit(outlen, key);
      blake2bUpdate(ctx, input);
      return blake2bFinal(ctx)
    }

    // Computes the BLAKE2B hash of a string or byte array
    //
    // Returns an n-byte hash in hex, all lowercase
    //
    // Parameters:
    // - input - the input bytes, as a string, Buffer, or Uint8Array
    // - key - optional key Uint8Array, up to 64 bytes
    // - outlen - optional output length in bytes, default 64
    function blake2bHex (input, key, outlen) {
      const output = blake2b(input, key, outlen);
      return util$1.toHex(output)
    }

    var blake2b_1 = {
      blake2b: blake2b,
      blake2bHex: blake2bHex,
      blake2bInit: blake2bInit,
      blake2bUpdate: blake2bUpdate,
      blake2bFinal: blake2bFinal
    };

    // BLAKE2s hash function in pure Javascript
    // Adapted from the reference implementation in RFC7693
    // Ported to Javascript by DC - https://github.com/dcposch

    const util = util$2;

    // Little-endian byte access.
    // Expects a Uint8Array and an index
    // Returns the little-endian uint32 at v[i..i+3]
    function B2S_GET32 (v, i) {
      return v[i] ^ (v[i + 1] << 8) ^ (v[i + 2] << 16) ^ (v[i + 3] << 24)
    }

    // Mixing function G.
    function B2S_G (a, b, c, d, x, y) {
      v[a] = v[a] + v[b] + x;
      v[d] = ROTR32(v[d] ^ v[a], 16);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 12);
      v[a] = v[a] + v[b] + y;
      v[d] = ROTR32(v[d] ^ v[a], 8);
      v[c] = v[c] + v[d];
      v[b] = ROTR32(v[b] ^ v[c], 7);
    }

    // 32-bit right rotation
    // x should be a uint32
    // y must be between 1 and 31, inclusive
    function ROTR32 (x, y) {
      return (x >>> y) ^ (x << (32 - y))
    }

    // Initialization Vector.
    const BLAKE2S_IV = new Uint32Array([
      0x6a09e667,
      0xbb67ae85,
      0x3c6ef372,
      0xa54ff53a,
      0x510e527f,
      0x9b05688c,
      0x1f83d9ab,
      0x5be0cd19
    ]);

    const SIGMA = new Uint8Array([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      14,
      10,
      4,
      8,
      9,
      15,
      13,
      6,
      1,
      12,
      0,
      2,
      11,
      7,
      5,
      3,
      11,
      8,
      12,
      0,
      5,
      2,
      15,
      13,
      10,
      14,
      3,
      6,
      7,
      1,
      9,
      4,
      7,
      9,
      3,
      1,
      13,
      12,
      11,
      14,
      2,
      6,
      5,
      10,
      4,
      0,
      15,
      8,
      9,
      0,
      5,
      7,
      2,
      4,
      10,
      15,
      14,
      1,
      11,
      12,
      6,
      8,
      3,
      13,
      2,
      12,
      6,
      10,
      0,
      11,
      8,
      3,
      4,
      13,
      7,
      5,
      15,
      14,
      1,
      9,
      12,
      5,
      1,
      15,
      14,
      13,
      4,
      10,
      0,
      7,
      6,
      3,
      9,
      2,
      8,
      11,
      13,
      11,
      7,
      14,
      12,
      1,
      3,
      9,
      5,
      0,
      15,
      4,
      8,
      6,
      2,
      10,
      6,
      15,
      14,
      9,
      11,
      3,
      0,
      8,
      12,
      2,
      13,
      7,
      1,
      4,
      10,
      5,
      10,
      2,
      8,
      4,
      7,
      6,
      1,
      5,
      15,
      11,
      9,
      14,
      3,
      12,
      13,
      0
    ]);

    // Compression function. "last" flag indicates last block
    const v = new Uint32Array(16);
    const m = new Uint32Array(16);
    function blake2sCompress (ctx, last) {
      let i = 0;
      for (i = 0; i < 8; i++) {
        // init work variables
        v[i] = ctx.h[i];
        v[i + 8] = BLAKE2S_IV[i];
      }

      v[12] ^= ctx.t; // low 32 bits of offset
      v[13] ^= ctx.t / 0x100000000; // high 32 bits
      if (last) {
        // last block flag set ?
        v[14] = ~v[14];
      }

      for (i = 0; i < 16; i++) {
        // get little-endian words
        m[i] = B2S_GET32(ctx.b, 4 * i);
      }

      // ten rounds of mixing
      // uncomment the DebugPrint calls to log the computation
      // and match the RFC sample documentation
      // util.debugPrint('          m[16]', m, 32)
      for (i = 0; i < 10; i++) {
        // util.debugPrint('   (i=' + i + ')  v[16]', v, 32)
        B2S_G(0, 4, 8, 12, m[SIGMA[i * 16 + 0]], m[SIGMA[i * 16 + 1]]);
        B2S_G(1, 5, 9, 13, m[SIGMA[i * 16 + 2]], m[SIGMA[i * 16 + 3]]);
        B2S_G(2, 6, 10, 14, m[SIGMA[i * 16 + 4]], m[SIGMA[i * 16 + 5]]);
        B2S_G(3, 7, 11, 15, m[SIGMA[i * 16 + 6]], m[SIGMA[i * 16 + 7]]);
        B2S_G(0, 5, 10, 15, m[SIGMA[i * 16 + 8]], m[SIGMA[i * 16 + 9]]);
        B2S_G(1, 6, 11, 12, m[SIGMA[i * 16 + 10]], m[SIGMA[i * 16 + 11]]);
        B2S_G(2, 7, 8, 13, m[SIGMA[i * 16 + 12]], m[SIGMA[i * 16 + 13]]);
        B2S_G(3, 4, 9, 14, m[SIGMA[i * 16 + 14]], m[SIGMA[i * 16 + 15]]);
      }
      // util.debugPrint('   (i=10) v[16]', v, 32)

      for (i = 0; i < 8; i++) {
        ctx.h[i] ^= v[i] ^ v[i + 8];
      }
      // util.debugPrint('h[8]', ctx.h, 32)
    }

    // Creates a BLAKE2s hashing context
    // Requires an output length between 1 and 32 bytes
    // Takes an optional Uint8Array key
    function blake2sInit (outlen, key) {
      if (!(outlen > 0 && outlen <= 32)) {
        throw new Error('Incorrect output length, should be in [1, 32]')
      }
      const keylen = key ? key.length : 0;
      if (key && !(keylen > 0 && keylen <= 32)) {
        throw new Error('Incorrect key length, should be in [1, 32]')
      }

      const ctx = {
        h: new Uint32Array(BLAKE2S_IV), // hash state
        b: new Uint8Array(64), // input block
        c: 0, // pointer within block
        t: 0, // input count
        outlen: outlen // output length in bytes
      };
      ctx.h[0] ^= 0x01010000 ^ (keylen << 8) ^ outlen;

      if (keylen > 0) {
        blake2sUpdate(ctx, key);
        ctx.c = 64; // at the end
      }

      return ctx
    }

    // Updates a BLAKE2s streaming hash
    // Requires hash context and Uint8Array (byte array)
    function blake2sUpdate (ctx, input) {
      for (let i = 0; i < input.length; i++) {
        if (ctx.c === 64) {
          // buffer full ?
          ctx.t += ctx.c; // add counters
          blake2sCompress(ctx, false); // compress (not last)
          ctx.c = 0; // counter to zero
        }
        ctx.b[ctx.c++] = input[i];
      }
    }

    // Completes a BLAKE2s streaming hash
    // Returns a Uint8Array containing the message digest
    function blake2sFinal (ctx) {
      ctx.t += ctx.c; // mark last block offset
      while (ctx.c < 64) {
        // fill up with zeros
        ctx.b[ctx.c++] = 0;
      }
      blake2sCompress(ctx, true); // final block flag = 1

      // little endian convert and store
      const out = new Uint8Array(ctx.outlen);
      for (let i = 0; i < ctx.outlen; i++) {
        out[i] = (ctx.h[i >> 2] >> (8 * (i & 3))) & 0xff;
      }
      return out
    }

    // Computes the BLAKE2S hash of a string or byte array, and returns a Uint8Array
    //
    // Returns a n-byte Uint8Array
    //
    // Parameters:
    // - input - the input bytes, as a string, Buffer, or Uint8Array
    // - key - optional key Uint8Array, up to 32 bytes
    // - outlen - optional output length in bytes, default 64
    function blake2s (input, key, outlen) {
      // preprocess inputs
      outlen = outlen || 32;
      input = util.normalizeInput(input);

      // do the math
      const ctx = blake2sInit(outlen, key);
      blake2sUpdate(ctx, input);
      return blake2sFinal(ctx)
    }

    // Computes the BLAKE2S hash of a string or byte array
    //
    // Returns an n-byte hash in hex, all lowercase
    //
    // Parameters:
    // - input - the input bytes, as a string, Buffer, or Uint8Array
    // - key - optional key Uint8Array, up to 32 bytes
    // - outlen - optional output length in bytes, default 64
    function blake2sHex (input, key, outlen) {
      const output = blake2s(input, key, outlen);
      return util.toHex(output)
    }

    var blake2s_1 = {
      blake2s: blake2s,
      blake2sHex: blake2sHex,
      blake2sInit: blake2sInit,
      blake2sUpdate: blake2sUpdate,
      blake2sFinal: blake2sFinal
    };

    const b2b = blake2b_1;
    const b2s = blake2s_1;

    var blakejs = {
      blake2b: b2b.blake2b,
      blake2bHex: b2b.blake2bHex,
      blake2bInit: b2b.blake2bInit,
      blake2bUpdate: b2b.blake2bUpdate,
      blake2bFinal: b2b.blake2bFinal,
      blake2s: b2s.blake2s,
      blake2sHex: b2s.blake2sHex,
      blake2sInit: b2s.blake2sInit,
      blake2sUpdate: b2s.blake2sUpdate,
      blake2sFinal: b2s.blake2sFinal
    };

    // WebCrypto
    /* eslint-env browser */
    var crypto$1 = (self.crypto || self.msCrypto);

    // browser TextDecoder/TextEncoder
    /* eslint-env browser */
    const TextDecoder = self.TextDecoder;
    const TextEncoder$1 = self.TextEncoder;

    function stringToUint8Array(data) {
      if(typeof data === 'string') {
        // convert data to Uint8Array
        return new TextEncoder$1().encode(data);
      }
      if(!(data instanceof Uint8Array)) {
        throw new TypeError('"data" be a string or Uint8Array.');
      }
      return data;
    }

    /*!
     * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
     */

    class MultihashSha2256 {
      /**
       * Creates a new MultihashSha2256 data codec.
       *
       * @returns {MultihashSha2256} A MultihashSha2256 used to encode and decode
       *   Multihash SHA-2 256-bit values.
       */
      constructor() {
        this.identifier = new Uint8Array([0x12, 0x20]);
        this.algorithm = 'mh-sha2-256';
        this.name = 'sha2-256';
      }

      /**
       * Encoder that takes a Uint8Array as input and performs a SHA-2
       * cryptographic hash on the data and outputs a multihash-encoded value.
       *
       * @param {Uint8Array} input - The input for the encode function.
       *
       * @returns {Uint8Array} The output of the encode function.
       */
      async encode(input) {
        const sha2256 = new Uint8Array(
          await crypto$1.subtle.digest({name: 'SHA-256'}, input));
        const mhsha2256 = new Uint8Array(
          sha2256.byteLength + this.identifier.byteLength);

        mhsha2256.set(this.identifier, 0);
        mhsha2256.set(sha2256, this.identifier.byteLength);

        return mhsha2256;
      }

      decode(input) {
        return input.slice(this.identifier.length);
      }
    }

    class MultihashBlake2b64 {
      /**
       * Creates a new MultihashBlake2b64 data codec.
       *
       * @returns {MultihashBlake2b64} A MultihashBlake2b64 used to encode and
       *   decode Multihash Blake2b 64-bit values.
       */
      constructor() {
        this.identifier = new Uint8Array([0xb2, 0x08, 0x08]);
        this.algorithm = 'mh-blake2b-64';
        this.name = 'blake2b-64';
      }

      /**
       * Encoder function that takes a Uint8Array as input and performs a blake2b
       * cryptographic hash on the data and outputs a multihash-encoded value.
       *
       * @param {Uint8Array} input - The input for the encode function.
       *
       * @returns {Uint8Array} The output of the encode function.
       */
      async encode(input) {
        const blake2b64 = blakejs.blake2b(input, null, 8);
        const mhblake2b64 = new Uint8Array(
          blake2b64.byteLength + this.identifier.byteLength);

        mhblake2b64.set(this.identifier, 0);
        mhblake2b64.set(blake2b64, this.identifier.byteLength);

        return mhblake2b64;
      }

      decode(input) {
        return input.slice(this.identifier.length);
      }
    }

    class MultibaseBase58btc {
      /**
       * Creates a new MultibaseBase58btc data codec.
       *
       * @returns {MultibaseBase58btc} A MultibaseBase58btc used to encode and
       *   decode Multibase base58btc values.
       */
      constructor() {
        this.identifier = new Uint8Array([0x7a]);
        this.algorithm = 'mb-base58-btc';
        this.name = 'base58-btc';
      }

      /**
       * Encoder function that takes a Uint8Array as input and performs a multibase
       * base58btc encoding on the data.
       *
       * @param {Uint8Array} input - The input for the encode function.
       *
       * @returns {Uint8Array} The output of the encode function.
       */
      encode(input) {
        return new Uint8Array(stringToUint8Array('z' + encode(input)));
      }

      /**
       * Decoder function that takes a Uint8Array as input and performs a multibase
       * base58btc decode on the data.
       *
       * @param {Uint8Array} input - The input for the decode function.
       *
       * @returns {Uint8Array} The output of the decode function.
       */
      decode(input) {
        return decode(new TextDecoder('utf-8').decode(input.slice(1)));
      }
    }

    var src = {};

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_polyfillNode_buffer);

    var ieee754$1 = {};

    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

    ieee754$1.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    };

    ieee754$1.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = ((value * c) - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    };

    var bignumber = {exports: {}};

    (function (module) {
    (function (globalObject) {

    /*
     *      bignumber.js v9.0.2
     *      A JavaScript library for arbitrary-precision arithmetic.
     *      https://github.com/MikeMcl/bignumber.js
     *      Copyright (c) 2021 Michael Mclaughlin <M8ch88l@gmail.com>
     *      MIT Licensed.
     *
     *      BigNumber.prototype methods     |  BigNumber methods
     *                                      |
     *      absoluteValue            abs    |  clone
     *      comparedTo                      |  config               set
     *      decimalPlaces            dp     |      DECIMAL_PLACES
     *      dividedBy                div    |      ROUNDING_MODE
     *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
     *      exponentiatedBy          pow    |      RANGE
     *      integerValue                    |      CRYPTO
     *      isEqualTo                eq     |      MODULO_MODE
     *      isFinite                        |      POW_PRECISION
     *      isGreaterThan            gt     |      FORMAT
     *      isGreaterThanOrEqualTo   gte    |      ALPHABET
     *      isInteger                       |  isBigNumber
     *      isLessThan               lt     |  maximum              max
     *      isLessThanOrEqualTo      lte    |  minimum              min
     *      isNaN                           |  random
     *      isNegative                      |  sum
     *      isPositive                      |
     *      isZero                          |
     *      minus                           |
     *      modulo                   mod    |
     *      multipliedBy             times  |
     *      negated                         |
     *      plus                            |
     *      precision                sd     |
     *      shiftedBy                       |
     *      squareRoot               sqrt   |
     *      toExponential                   |
     *      toFixed                         |
     *      toFormat                        |
     *      toFraction                      |
     *      toJSON                          |
     *      toNumber                        |
     *      toPrecision                     |
     *      toString                        |
     *      valueOf                         |
     *
     */


      var BigNumber,
        isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
        mathceil = Math.ceil,
        mathfloor = Math.floor,

        bignumberError = '[BigNumber Error] ',
        tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

        BASE = 1e14,
        LOG_BASE = 14,
        MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
        // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
        SQRT_BASE = 1e7,

        // EDITABLE
        // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
        // the arguments to toExponential, toFixed, toFormat, and toPrecision.
        MAX = 1E9;                                   // 0 to MAX_INT32


      /*
       * Create and return a BigNumber constructor.
       */
      function clone(configObject) {
        var div, convertBase, parseNumeric,
          P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
          ONE = new BigNumber(1),


          //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


          // The default values below must be integers within the inclusive ranges stated.
          // The values can also be changed at run-time using BigNumber.set.

          // The maximum number of decimal places for operations involving division.
          DECIMAL_PLACES = 20,                     // 0 to MAX

          // The rounding mode used when rounding to the above decimal places, and when using
          // toExponential, toFixed, toFormat and toPrecision, and round (default value).
          // UP         0 Away from zero.
          // DOWN       1 Towards zero.
          // CEIL       2 Towards +Infinity.
          // FLOOR      3 Towards -Infinity.
          // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
          // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
          // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
          // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
          // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
          ROUNDING_MODE = 4,                       // 0 to 8

          // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

          // The exponent value at and beneath which toString returns exponential notation.
          // Number type: -7
          TO_EXP_NEG = -7,                         // 0 to -MAX

          // The exponent value at and above which toString returns exponential notation.
          // Number type: 21
          TO_EXP_POS = 21,                         // 0 to MAX

          // RANGE : [MIN_EXP, MAX_EXP]

          // The minimum exponent value, beneath which underflow to zero occurs.
          // Number type: -324  (5e-324)
          MIN_EXP = -1e7,                          // -1 to -MAX

          // The maximum exponent value, above which overflow to Infinity occurs.
          // Number type:  308  (1.7976931348623157e+308)
          // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
          MAX_EXP = 1e7,                           // 1 to MAX

          // Whether to use cryptographically-secure random number generation, if available.
          CRYPTO = false,                          // true or false

          // The modulo mode used when calculating the modulus: a mod n.
          // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
          // The remainder (r) is calculated as: r = a - n * q.
          //
          // UP        0 The remainder is positive if the dividend is negative, else is negative.
          // DOWN      1 The remainder has the same sign as the dividend.
          //             This modulo mode is commonly known as 'truncated division' and is
          //             equivalent to (a % n) in JavaScript.
          // FLOOR     3 The remainder has the same sign as the divisor (Python %).
          // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
          // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
          //             The remainder is always positive.
          //
          // The truncated division, floored division, Euclidian division and IEEE 754 remainder
          // modes are commonly used for the modulus operation.
          // Although the other rounding modes can also be used, they may not give useful results.
          MODULO_MODE = 1,                         // 0 to 9

          // The maximum number of significant digits of the result of the exponentiatedBy operation.
          // If POW_PRECISION is 0, there will be unlimited significant digits.
          POW_PRECISION = 0,                       // 0 to MAX

          // The format specification used by the BigNumber.prototype.toFormat method.
          FORMAT = {
            prefix: '',
            groupSize: 3,
            secondaryGroupSize: 0,
            groupSeparator: ',',
            decimalSeparator: '.',
            fractionGroupSize: 0,
            fractionGroupSeparator: '\xA0',        // non-breaking space
            suffix: ''
          },

          // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
          // '-', '.', whitespace, or repeated character.
          // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
          ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz',
          alphabetHasNormalDecimalDigits = true;


        //------------------------------------------------------------------------------------------


        // CONSTRUCTOR


        /*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * v {number|string|BigNumber} A numeric value.
         * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
         */
        function BigNumber(v, b) {
          var alphabet, c, caseChanged, e, i, isNum, len, str,
            x = this;

          // Enable constructor call without `new`.
          if (!(x instanceof BigNumber)) return new BigNumber(v, b);

          if (b == null) {

            if (v && v._isBigNumber === true) {
              x.s = v.s;

              if (!v.c || v.e > MAX_EXP) {
                x.c = x.e = null;
              } else if (v.e < MIN_EXP) {
                x.c = [x.e = 0];
              } else {
                x.e = v.e;
                x.c = v.c.slice();
              }

              return;
            }

            if ((isNum = typeof v == 'number') && v * 0 == 0) {

              // Use `1 / n` to handle minus zero also.
              x.s = 1 / v < 0 ? (v = -v, -1) : 1;

              // Fast path for integers, where n < 2147483648 (2**31).
              if (v === ~~v) {
                for (e = 0, i = v; i >= 10; i /= 10, e++);

                if (e > MAX_EXP) {
                  x.c = x.e = null;
                } else {
                  x.e = e;
                  x.c = [v];
                }

                return;
              }

              str = String(v);
            } else {

              if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

              x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
            }

            // Decimal point?
            if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

            // Exponential form?
            if ((i = str.search(/e/i)) > 0) {

              // Determine exponent.
              if (e < 0) e = i;
              e += +str.slice(i + 1);
              str = str.substring(0, i);
            } else if (e < 0) {

              // Integer.
              e = str.length;
            }

          } else {

            // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
            intCheck(b, 2, ALPHABET.length, 'Base');

            // Allow exponential notation to be used with base 10 argument, while
            // also rounding to DECIMAL_PLACES as with other bases.
            if (b == 10 && alphabetHasNormalDecimalDigits) {
              x = new BigNumber(v);
              return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
            }

            str = String(v);

            if (isNum = typeof v == 'number') {

              // Avoid potential interpretation of Infinity and NaN as base 44+ values.
              if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

              x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

              // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
              if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
                throw Error
                 (tooManyDigits + v);
              }
            } else {
              x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
            }

            alphabet = ALPHABET.slice(0, b);
            e = i = 0;

            // Check that str is a valid base b number.
            // Don't use RegExp, so alphabet can contain special characters.
            for (len = str.length; i < len; i++) {
              if (alphabet.indexOf(c = str.charAt(i)) < 0) {
                if (c == '.') {

                  // If '.' is not the first character and it has not be found before.
                  if (i > e) {
                    e = len;
                    continue;
                  }
                } else if (!caseChanged) {

                  // Allow e.g. hexadecimal 'FF' as well as 'ff'.
                  if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                      str == str.toLowerCase() && (str = str.toUpperCase())) {
                    caseChanged = true;
                    i = -1;
                    e = 0;
                    continue;
                  }
                }

                return parseNumeric(x, String(v), isNum, b);
              }
            }

            // Prevent later check for length on converted number.
            isNum = false;
            str = convertBase(str, b, 10, x.s);

            // Decimal point?
            if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
            else e = str.length;
          }

          // Determine leading zeros.
          for (i = 0; str.charCodeAt(i) === 48; i++);

          // Determine trailing zeros.
          for (len = str.length; str.charCodeAt(--len) === 48;);

          if (str = str.slice(i, ++len)) {
            len -= i;

            // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
            if (isNum && BigNumber.DEBUG &&
              len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
                throw Error
                 (tooManyDigits + (x.s * v));
            }

             // Overflow?
            if ((e = e - i - 1) > MAX_EXP) {

              // Infinity.
              x.c = x.e = null;

            // Underflow?
            } else if (e < MIN_EXP) {

              // Zero.
              x.c = [x.e = 0];
            } else {
              x.e = e;
              x.c = [];

              // Transform base

              // e is the base 10 exponent.
              // i is where to slice str to get the first element of the coefficient array.
              i = (e + 1) % LOG_BASE;
              if (e < 0) i += LOG_BASE;  // i < 1

              if (i < len) {
                if (i) x.c.push(+str.slice(0, i));

                for (len -= LOG_BASE; i < len;) {
                  x.c.push(+str.slice(i, i += LOG_BASE));
                }

                i = LOG_BASE - (str = str.slice(i)).length;
              } else {
                i -= len;
              }

              for (; i--; str += '0');
              x.c.push(+str);
            }
          } else {

            // Zero.
            x.c = [x.e = 0];
          }
        }


        // CONSTRUCTOR PROPERTIES


        BigNumber.clone = clone;

        BigNumber.ROUND_UP = 0;
        BigNumber.ROUND_DOWN = 1;
        BigNumber.ROUND_CEIL = 2;
        BigNumber.ROUND_FLOOR = 3;
        BigNumber.ROUND_HALF_UP = 4;
        BigNumber.ROUND_HALF_DOWN = 5;
        BigNumber.ROUND_HALF_EVEN = 6;
        BigNumber.ROUND_HALF_CEIL = 7;
        BigNumber.ROUND_HALF_FLOOR = 8;
        BigNumber.EUCLID = 9;


        /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object with the following optional properties (if the value of a property is
         * a number, it must be an integer within the inclusive range stated):
         *
         *   DECIMAL_PLACES   {number}           0 to MAX
         *   ROUNDING_MODE    {number}           0 to 8
         *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
         *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
         *   CRYPTO           {boolean}          true or false
         *   MODULO_MODE      {number}           0 to 9
         *   POW_PRECISION       {number}           0 to MAX
         *   ALPHABET         {string}           A string of two or more unique characters which does
         *                                       not contain '.'.
         *   FORMAT           {object}           An object with some of the following properties:
         *     prefix                 {string}
         *     groupSize              {number}
         *     secondaryGroupSize     {number}
         *     groupSeparator         {string}
         *     decimalSeparator       {string}
         *     fractionGroupSize      {number}
         *     fractionGroupSeparator {string}
         *     suffix                 {string}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined, except for ALPHABET.
         *
         * Return an object with the properties current values.
         */
        BigNumber.config = BigNumber.set = function (obj) {
          var p, v;

          if (obj != null) {

            if (typeof obj == 'object') {

              // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
              // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
              if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
                v = obj[p];
                intCheck(v, 0, MAX, p);
                DECIMAL_PLACES = v;
              }

              // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
              // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
              if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
                v = obj[p];
                intCheck(v, 0, 8, p);
                ROUNDING_MODE = v;
              }

              // EXPONENTIAL_AT {number|number[]}
              // Integer, -MAX to MAX inclusive or
              // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
              // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
              if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
                v = obj[p];
                if (v && v.pop) {
                  intCheck(v[0], -MAX, 0, p);
                  intCheck(v[1], 0, MAX, p);
                  TO_EXP_NEG = v[0];
                  TO_EXP_POS = v[1];
                } else {
                  intCheck(v, -MAX, MAX, p);
                  TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
                }
              }

              // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
              // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
              // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
              if (obj.hasOwnProperty(p = 'RANGE')) {
                v = obj[p];
                if (v && v.pop) {
                  intCheck(v[0], -MAX, -1, p);
                  intCheck(v[1], 1, MAX, p);
                  MIN_EXP = v[0];
                  MAX_EXP = v[1];
                } else {
                  intCheck(v, -MAX, MAX, p);
                  if (v) {
                    MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
                  } else {
                    throw Error
                     (bignumberError + p + ' cannot be zero: ' + v);
                  }
                }
              }

              // CRYPTO {boolean} true or false.
              // '[BigNumber Error] CRYPTO not true or false: {v}'
              // '[BigNumber Error] crypto unavailable'
              if (obj.hasOwnProperty(p = 'CRYPTO')) {
                v = obj[p];
                if (v === !!v) {
                  if (v) {
                    if (typeof crypto != 'undefined' && crypto &&
                     (crypto.getRandomValues || crypto.randomBytes)) {
                      CRYPTO = v;
                    } else {
                      CRYPTO = !v;
                      throw Error
                       (bignumberError + 'crypto unavailable');
                    }
                  } else {
                    CRYPTO = v;
                  }
                } else {
                  throw Error
                   (bignumberError + p + ' not true or false: ' + v);
                }
              }

              // MODULO_MODE {number} Integer, 0 to 9 inclusive.
              // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
              if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
                v = obj[p];
                intCheck(v, 0, 9, p);
                MODULO_MODE = v;
              }

              // POW_PRECISION {number} Integer, 0 to MAX inclusive.
              // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
              if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
                v = obj[p];
                intCheck(v, 0, MAX, p);
                POW_PRECISION = v;
              }

              // FORMAT {object}
              // '[BigNumber Error] FORMAT not an object: {v}'
              if (obj.hasOwnProperty(p = 'FORMAT')) {
                v = obj[p];
                if (typeof v == 'object') FORMAT = v;
                else throw Error
                 (bignumberError + p + ' not an object: ' + v);
              }

              // ALPHABET {string}
              // '[BigNumber Error] ALPHABET invalid: {v}'
              if (obj.hasOwnProperty(p = 'ALPHABET')) {
                v = obj[p];

                // Disallow if less than two characters,
                // or if it contains '+', '-', '.', whitespace, or a repeated character.
                if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
                  alphabetHasNormalDecimalDigits = v.slice(0, 10) == '0123456789';
                  ALPHABET = v;
                } else {
                  throw Error
                   (bignumberError + p + ' invalid: ' + v);
                }
              }

            } else {

              // '[BigNumber Error] Object expected: {v}'
              throw Error
               (bignumberError + 'Object expected: ' + obj);
            }
          }

          return {
            DECIMAL_PLACES: DECIMAL_PLACES,
            ROUNDING_MODE: ROUNDING_MODE,
            EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
            RANGE: [MIN_EXP, MAX_EXP],
            CRYPTO: CRYPTO,
            MODULO_MODE: MODULO_MODE,
            POW_PRECISION: POW_PRECISION,
            FORMAT: FORMAT,
            ALPHABET: ALPHABET
          };
        };


        /*
         * Return true if v is a BigNumber instance, otherwise return false.
         *
         * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
         *
         * v {any}
         *
         * '[BigNumber Error] Invalid BigNumber: {v}'
         */
        BigNumber.isBigNumber = function (v) {
          if (!v || v._isBigNumber !== true) return false;
          if (!BigNumber.DEBUG) return true;

          var i, n,
            c = v.c,
            e = v.e,
            s = v.s;

          out: if ({}.toString.call(c) == '[object Array]') {

            if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

              // If the first element is zero, the BigNumber value must be zero.
              if (c[0] === 0) {
                if (e === 0 && c.length === 1) return true;
                break out;
              }

              // Calculate number of digits that c[0] should have, based on the exponent.
              i = (e + 1) % LOG_BASE;
              if (i < 1) i += LOG_BASE;

              // Calculate number of digits of c[0].
              //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
              if (String(c[0]).length == i) {

                for (i = 0; i < c.length; i++) {
                  n = c[i];
                  if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
                }

                // Last element cannot be zero, unless it is the only element.
                if (n !== 0) return true;
              }
            }

          // Infinity/NaN
          } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
            return true;
          }

          throw Error
            (bignumberError + 'Invalid BigNumber: ' + v);
        };


        /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.maximum = BigNumber.max = function () {
          return maxOrMin(arguments, P.lt);
        };


        /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.minimum = BigNumber.min = function () {
          return maxOrMin(arguments, P.gt);
        };


        /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
         * '[BigNumber Error] crypto unavailable'
         */
        BigNumber.random = (function () {
          var pow2_53 = 0x20000000000000;

          // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
          // Check if Math.random() produces more than 32 bits of randomness.
          // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
          // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
          var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
           ? function () { return mathfloor(Math.random() * pow2_53); }
           : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
             (Math.random() * 0x800000 | 0); };

          return function (dp) {
            var a, b, e, k, v,
              i = 0,
              c = [],
              rand = new BigNumber(ONE);

            if (dp == null) dp = DECIMAL_PLACES;
            else intCheck(dp, 0, MAX);

            k = mathceil(dp / LOG_BASE);

            if (CRYPTO) {

              // Browsers supporting crypto.getRandomValues.
              if (crypto.getRandomValues) {

                a = crypto.getRandomValues(new Uint32Array(k *= 2));

                for (; i < k;) {

                  // 53 bits:
                  // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
                  // 11111 11111111 11111111 11111111 11100000 00000000 00000000
                  // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
                  //                                     11111 11111111 11111111
                  // 0x20000 is 2^21.
                  v = a[i] * 0x20000 + (a[i + 1] >>> 11);

                  // Rejection sampling:
                  // 0 <= v < 9007199254740992
                  // Probability that v >= 9e15, is
                  // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
                  if (v >= 9e15) {
                    b = crypto.getRandomValues(new Uint32Array(2));
                    a[i] = b[0];
                    a[i + 1] = b[1];
                  } else {

                    // 0 <= v <= 8999999999999999
                    // 0 <= (v % 1e14) <= 99999999999999
                    c.push(v % 1e14);
                    i += 2;
                  }
                }
                i = k / 2;

              // Node.js supporting crypto.randomBytes.
              } else if (crypto.randomBytes) {

                // buffer
                a = crypto.randomBytes(k *= 7);

                for (; i < k;) {

                  // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
                  // 0x100000000 is 2^32, 0x1000000 is 2^24
                  // 11111 11111111 11111111 11111111 11111111 11111111 11111111
                  // 0 <= v < 9007199254740992
                  v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
                     (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
                     (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

                  if (v >= 9e15) {
                    crypto.randomBytes(7).copy(a, i);
                  } else {

                    // 0 <= (v % 1e14) <= 99999999999999
                    c.push(v % 1e14);
                    i += 7;
                  }
                }
                i = k / 7;
              } else {
                CRYPTO = false;
                throw Error
                 (bignumberError + 'crypto unavailable');
              }
            }

            // Use Math.random.
            if (!CRYPTO) {

              for (; i < k;) {
                v = random53bitInt();
                if (v < 9e15) c[i++] = v % 1e14;
              }
            }

            k = c[--i];
            dp %= LOG_BASE;

            // Convert trailing digits to zeros according to dp.
            if (k && dp) {
              v = POWS_TEN[LOG_BASE - dp];
              c[i] = mathfloor(k / v) * v;
            }

            // Remove trailing elements which are zero.
            for (; c[i] === 0; c.pop(), i--);

            // Zero?
            if (i < 0) {
              c = [e = 0];
            } else {

              // Remove leading elements which are zero and adjust exponent accordingly.
              for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

              // Count the digits of the first element of c to determine leading zeros, and...
              for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

              // adjust the exponent accordingly.
              if (i < LOG_BASE) e -= LOG_BASE - i;
            }

            rand.e = e;
            rand.c = c;
            return rand;
          };
        })();


        /*
         * Return a BigNumber whose value is the sum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.sum = function () {
          var i = 1,
            args = arguments,
            sum = new BigNumber(args[0]);
          for (; i < args.length;) sum = sum.plus(args[i++]);
          return sum;
        };


        // PRIVATE FUNCTIONS


        // Called by BigNumber and BigNumber.prototype.toString.
        convertBase = (function () {
          var decimal = '0123456789';

          /*
           * Convert string of baseIn to an array of numbers of baseOut.
           * Eg. toBaseOut('255', 10, 16) returns [15, 15].
           * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
           */
          function toBaseOut(str, baseIn, baseOut, alphabet) {
            var j,
              arr = [0],
              arrL,
              i = 0,
              len = str.length;

            for (; i < len;) {
              for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

              arr[0] += alphabet.indexOf(str.charAt(i++));

              for (j = 0; j < arr.length; j++) {

                if (arr[j] > baseOut - 1) {
                  if (arr[j + 1] == null) arr[j + 1] = 0;
                  arr[j + 1] += arr[j] / baseOut | 0;
                  arr[j] %= baseOut;
                }
              }
            }

            return arr.reverse();
          }

          // Convert a numeric string of baseIn to a numeric string of baseOut.
          // If the caller is toString, we are converting from base 10 to baseOut.
          // If the caller is BigNumber, we are converting from baseIn to base 10.
          return function (str, baseIn, baseOut, sign, callerIsToString) {
            var alphabet, d, e, k, r, x, xc, y,
              i = str.indexOf('.'),
              dp = DECIMAL_PLACES,
              rm = ROUNDING_MODE;

            // Non-integer.
            if (i >= 0) {
              k = POW_PRECISION;

              // Unlimited precision.
              POW_PRECISION = 0;
              str = str.replace('.', '');
              y = new BigNumber(baseIn);
              x = y.pow(str.length - i);
              POW_PRECISION = k;

              // Convert str as if an integer, then restore the fraction part by dividing the
              // result by its base raised to a power.

              y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
               10, baseOut, decimal);
              y.e = y.c.length;
            }

            // Convert the number as integer.

            xc = toBaseOut(str, baseIn, baseOut, callerIsToString
             ? (alphabet = ALPHABET, decimal)
             : (alphabet = decimal, ALPHABET));

            // xc now represents str as an integer and converted to baseOut. e is the exponent.
            e = k = xc.length;

            // Remove trailing zeros.
            for (; xc[--k] == 0; xc.pop());

            // Zero?
            if (!xc[0]) return alphabet.charAt(0);

            // Does str represent an integer? If so, no need for the division.
            if (i < 0) {
              --e;
            } else {
              x.c = xc;
              x.e = e;

              // The sign is needed for correct rounding.
              x.s = sign;
              x = div(x, y, dp, rm, baseOut);
              xc = x.c;
              r = x.r;
              e = x.e;
            }

            // xc now represents str converted to baseOut.

            // THe index of the rounding digit.
            d = e + dp + 1;

            // The rounding digit: the digit to the right of the digit that may be rounded up.
            i = xc[d];

            // Look at the rounding digits and mode to determine whether to round up.

            k = baseOut / 2;
            r = r || d < 0 || xc[d + 1] != null;

            r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
                  : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
                   rm == (x.s < 0 ? 8 : 7));

            // If the index of the rounding digit is not greater than zero, or xc represents
            // zero, then the result of the base conversion is zero or, if rounding up, a value
            // such as 0.00001.
            if (d < 1 || !xc[0]) {

              // 1^-dp or 0
              str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
            } else {

              // Truncate xc to the required number of decimal places.
              xc.length = d;

              // Round up?
              if (r) {

                // Rounding up may mean the previous digit has to be rounded up and so on.
                for (--baseOut; ++xc[--d] > baseOut;) {
                  xc[d] = 0;

                  if (!d) {
                    ++e;
                    xc = [1].concat(xc);
                  }
                }
              }

              // Determine trailing zeros.
              for (k = xc.length; !xc[--k];);

              // E.g. [4, 11, 15] becomes 4bf.
              for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

              // Add leading zeros, decimal point and trailing zeros as required.
              str = toFixedPoint(str, e, alphabet.charAt(0));
            }

            // The caller will add the sign.
            return str;
          };
        })();


        // Perform division in the specified base. Called by div and convertBase.
        div = (function () {

          // Assume non-zero x and k.
          function multiply(x, k, base) {
            var m, temp, xlo, xhi,
              carry = 0,
              i = x.length,
              klo = k % SQRT_BASE,
              khi = k / SQRT_BASE | 0;

            for (x = x.slice(); i--;) {
              xlo = x[i] % SQRT_BASE;
              xhi = x[i] / SQRT_BASE | 0;
              m = khi * xlo + xhi * klo;
              temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
              carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
              x[i] = temp % base;
            }

            if (carry) x = [carry].concat(x);

            return x;
          }

          function compare(a, b, aL, bL) {
            var i, cmp;

            if (aL != bL) {
              cmp = aL > bL ? 1 : -1;
            } else {

              for (i = cmp = 0; i < aL; i++) {

                if (a[i] != b[i]) {
                  cmp = a[i] > b[i] ? 1 : -1;
                  break;
                }
              }
            }

            return cmp;
          }

          function subtract(a, b, aL, base) {
            var i = 0;

            // Subtract b from a.
            for (; aL--;) {
              a[aL] -= i;
              i = a[aL] < b[aL] ? 1 : 0;
              a[aL] = i * base + a[aL] - b[aL];
            }

            // Remove leading zeros.
            for (; !a[0] && a.length > 1; a.splice(0, 1));
          }

          // x: dividend, y: divisor.
          return function (x, y, dp, rm, base) {
            var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
              yL, yz,
              s = x.s == y.s ? 1 : -1,
              xc = x.c,
              yc = y.c;

            // Either NaN, Infinity or 0?
            if (!xc || !xc[0] || !yc || !yc[0]) {

              return new BigNumber(

               // Return NaN if either NaN, or both Infinity or 0.
               !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

                // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                xc && xc[0] == 0 || !yc ? s * 0 : s / 0
             );
            }

            q = new BigNumber(s);
            qc = q.c = [];
            e = x.e - y.e;
            s = dp + e + 1;

            if (!base) {
              base = BASE;
              e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
              s = s / LOG_BASE | 0;
            }

            // Result exponent may be one less then the current value of e.
            // The coefficients of the BigNumbers from convertBase may have trailing zeros.
            for (i = 0; yc[i] == (xc[i] || 0); i++);

            if (yc[i] > (xc[i] || 0)) e--;

            if (s < 0) {
              qc.push(1);
              more = true;
            } else {
              xL = xc.length;
              yL = yc.length;
              i = 0;
              s += 2;

              // Normalise xc and yc so highest order digit of yc is >= base / 2.

              n = mathfloor(base / (yc[0] + 1));

              // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
              // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
              if (n > 1) {
                yc = multiply(yc, n, base);
                xc = multiply(xc, n, base);
                yL = yc.length;
                xL = xc.length;
              }

              xi = yL;
              rem = xc.slice(0, yL);
              remL = rem.length;

              // Add zeros to make remainder as long as divisor.
              for (; remL < yL; rem[remL++] = 0);
              yz = yc.slice();
              yz = [0].concat(yz);
              yc0 = yc[0];
              if (yc[1] >= base / 2) yc0++;
              // Not necessary, but to prevent trial digit n > base, when using base 3.
              // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

              do {
                n = 0;

                // Compare divisor and remainder.
                cmp = compare(yc, rem, yL, remL);

                // If divisor < remainder.
                if (cmp < 0) {

                  // Calculate trial digit, n.

                  rem0 = rem[0];
                  if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

                  // n is how many times the divisor goes into the current remainder.
                  n = mathfloor(rem0 / yc0);

                  //  Algorithm:
                  //  product = divisor multiplied by trial digit (n).
                  //  Compare product and remainder.
                  //  If product is greater than remainder:
                  //    Subtract divisor from product, decrement trial digit.
                  //  Subtract product from remainder.
                  //  If product was less than remainder at the last compare:
                  //    Compare new remainder and divisor.
                  //    If remainder is greater than divisor:
                  //      Subtract divisor from remainder, increment trial digit.

                  if (n > 1) {

                    // n may be > base only when base is 3.
                    if (n >= base) n = base - 1;

                    // product = divisor * trial digit.
                    prod = multiply(yc, n, base);
                    prodL = prod.length;
                    remL = rem.length;

                    // Compare product and remainder.
                    // If product > remainder then trial digit n too high.
                    // n is 1 too high about 5% of the time, and is not known to have
                    // ever been more than 1 too high.
                    while (compare(prod, rem, prodL, remL) == 1) {
                      n--;

                      // Subtract divisor from product.
                      subtract(prod, yL < prodL ? yz : yc, prodL, base);
                      prodL = prod.length;
                      cmp = 1;
                    }
                  } else {

                    // n is 0 or 1, cmp is -1.
                    // If n is 0, there is no need to compare yc and rem again below,
                    // so change cmp to 1 to avoid it.
                    // If n is 1, leave cmp as -1, so yc and rem are compared again.
                    if (n == 0) {

                      // divisor < remainder, so n must be at least 1.
                      cmp = n = 1;
                    }

                    // product = divisor
                    prod = yc.slice();
                    prodL = prod.length;
                  }

                  if (prodL < remL) prod = [0].concat(prod);

                  // Subtract product from remainder.
                  subtract(rem, prod, remL, base);
                  remL = rem.length;

                   // If product was < remainder.
                  if (cmp == -1) {

                    // Compare divisor and new remainder.
                    // If divisor < new remainder, subtract divisor from remainder.
                    // Trial digit n too low.
                    // n is 1 too low about 5% of the time, and very rarely 2 too low.
                    while (compare(yc, rem, yL, remL) < 1) {
                      n++;

                      // Subtract divisor from remainder.
                      subtract(rem, yL < remL ? yz : yc, remL, base);
                      remL = rem.length;
                    }
                  }
                } else if (cmp === 0) {
                  n++;
                  rem = [0];
                } // else cmp === 1 and n will be 0

                // Add the next digit, n, to the result array.
                qc[i++] = n;

                // Update the remainder.
                if (rem[0]) {
                  rem[remL++] = xc[xi] || 0;
                } else {
                  rem = [xc[xi]];
                  remL = 1;
                }
              } while ((xi++ < xL || rem[0] != null) && s--);

              more = rem[0] != null;

              // Leading zero?
              if (!qc[0]) qc.splice(0, 1);
            }

            if (base == BASE) {

              // To calculate q.e, first get the number of digits of qc[0].
              for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

              round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

            // Caller is convertBase.
            } else {
              q.e = e;
              q.r = +more;
            }

            return q;
          };
        })();


        /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n: a BigNumber.
         * i: the index of the last digit required (i.e. the digit that may be rounded up).
         * rm: the rounding mode.
         * id: 1 (toExponential) or 2 (toPrecision).
         */
        function format(n, i, rm, id) {
          var c0, e, ne, len, str;

          if (rm == null) rm = ROUNDING_MODE;
          else intCheck(rm, 0, 8);

          if (!n.c) return n.toString();

          c0 = n.c[0];
          ne = n.e;

          if (i == null) {
            str = coeffToString(n.c);
            str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
             ? toExponential(str, ne)
             : toFixedPoint(str, ne, '0');
          } else {
            n = round(new BigNumber(n), i, rm);

            // n.e may have changed if the value was rounded up.
            e = n.e;

            str = coeffToString(n.c);
            len = str.length;

            // toPrecision returns exponential notation if the number of significant digits
            // specified is less than the number of digits necessary to represent the integer
            // part of the value in fixed-point notation.

            // Exponential notation.
            if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

              // Append zeros?
              for (; len < i; str += '0', len++);
              str = toExponential(str, e);

            // Fixed-point notation.
            } else {
              i -= ne;
              str = toFixedPoint(str, e, '0');

              // Append zeros?
              if (e + 1 > len) {
                if (--i > 0) for (str += '.'; i--; str += '0');
              } else {
                i += e - len;
                if (i > 0) {
                  if (e + 1 == len) str += '.';
                  for (; i--; str += '0');
                }
              }
            }
          }

          return n.s < 0 && c0 ? '-' + str : str;
        }


        // Handle BigNumber.max and BigNumber.min.
        function maxOrMin(args, method) {
          var n,
            i = 1,
            m = new BigNumber(args[0]);

          for (; i < args.length; i++) {
            n = new BigNumber(args[i]);

            // If any number is NaN, return NaN.
            if (!n.s) {
              m = n;
              break;
            } else if (method.call(m, n)) {
              m = n;
            }
          }

          return m;
        }


        /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */
        function normalise(n, c, e) {
          var i = 1,
            j = c.length;

           // Remove trailing zeros.
          for (; !c[--j]; c.pop());

          // Calculate the base 10 exponent. First get the number of digits of c[0].
          for (j = c[0]; j >= 10; j /= 10, i++);

          // Overflow?
          if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

            // Infinity.
            n.c = n.e = null;

          // Underflow?
          } else if (e < MIN_EXP) {

            // Zero.
            n.c = [n.e = 0];
          } else {
            n.e = e;
            n.c = c;
          }

          return n;
        }


        // Handle values that fail the validity test in BigNumber.
        parseNumeric = (function () {
          var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
            dotAfter = /^([^.]+)\.$/,
            dotBefore = /^\.([^.]+)$/,
            isInfinityOrNaN = /^-?(Infinity|NaN)$/,
            whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

          return function (x, str, isNum, b) {
            var base,
              s = isNum ? str : str.replace(whitespaceOrPlus, '');

            // No exception on ±Infinity or NaN.
            if (isInfinityOrNaN.test(s)) {
              x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
            } else {
              if (!isNum) {

                // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
                s = s.replace(basePrefix, function (m, p1, p2) {
                  base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
                  return !b || b == base ? p1 : m;
                });

                if (b) {
                  base = b;

                  // E.g. '1.' to '1', '.1' to '0.1'
                  s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
                }

                if (str != s) return new BigNumber(s, base);
              }

              // '[BigNumber Error] Not a number: {n}'
              // '[BigNumber Error] Not a base {b} number: {n}'
              if (BigNumber.DEBUG) {
                throw Error
                  (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
              }

              // NaN
              x.s = null;
            }

            x.c = x.e = null;
          }
        })();


        /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */
        function round(x, sd, rm, r) {
          var d, i, j, k, n, ni, rd,
            xc = x.c,
            pows10 = POWS_TEN;

          // if x is not Infinity or NaN...
          if (xc) {

            // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
            // n is a base 1e14 number, the value of the element of array x.c containing rd.
            // ni is the index of n within x.c.
            // d is the number of digits of n.
            // i is the index of rd within n including leading zeros.
            // j is the actual index of rd within n (if < 0, rd is a leading zero).
            out: {

              // Get the number of digits of the first element of xc.
              for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
              i = sd - d;

              // If the rounding digit is in the first element of xc...
              if (i < 0) {
                i += LOG_BASE;
                j = sd;
                n = xc[ni = 0];

                // Get the rounding digit at index j of n.
                rd = n / pows10[d - j - 1] % 10 | 0;
              } else {
                ni = mathceil((i + 1) / LOG_BASE);

                if (ni >= xc.length) {

                  if (r) {

                    // Needed by sqrt.
                    for (; xc.length <= ni; xc.push(0));
                    n = rd = 0;
                    d = 1;
                    i %= LOG_BASE;
                    j = i - LOG_BASE + 1;
                  } else {
                    break out;
                  }
                } else {
                  n = k = xc[ni];

                  // Get the number of digits of n.
                  for (d = 1; k >= 10; k /= 10, d++);

                  // Get the index of rd within n.
                  i %= LOG_BASE;

                  // Get the index of rd within n, adjusted for leading zeros.
                  // The number of leading zeros of n is given by LOG_BASE - d.
                  j = i - LOG_BASE + d;

                  // Get the rounding digit at index j of n.
                  rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
                }
              }

              r = r || sd < 0 ||

              // Are there any non-zero digits after the rounding digit?
              // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
              // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
               xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

              r = rm < 4
               ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
               : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

                // Check whether the digit to the left of the rounding digit is odd.
                ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
                 rm == (x.s < 0 ? 8 : 7));

              if (sd < 1 || !xc[0]) {
                xc.length = 0;

                if (r) {

                  // Convert sd to decimal places.
                  sd -= x.e + 1;

                  // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                  xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
                  x.e = -sd || 0;
                } else {

                  // Zero.
                  xc[0] = x.e = 0;
                }

                return x;
              }

              // Remove excess digits.
              if (i == 0) {
                xc.length = ni;
                k = 1;
                ni--;
              } else {
                xc.length = ni + 1;
                k = pows10[LOG_BASE - i];

                // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                // j > 0 means i > number of leading zeros of n.
                xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
              }

              // Round up?
              if (r) {

                for (; ;) {

                  // If the digit to be rounded up is in the first element of xc...
                  if (ni == 0) {

                    // i will be the length of xc[0] before k is added.
                    for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
                    j = xc[0] += k;
                    for (k = 1; j >= 10; j /= 10, k++);

                    // if i != k the length has increased.
                    if (i != k) {
                      x.e++;
                      if (xc[0] == BASE) xc[0] = 1;
                    }

                    break;
                  } else {
                    xc[ni] += k;
                    if (xc[ni] != BASE) break;
                    xc[ni--] = 0;
                    k = 1;
                  }
                }
              }

              // Remove trailing zeros.
              for (i = xc.length; xc[--i] === 0; xc.pop());
            }

            // Overflow? Infinity.
            if (x.e > MAX_EXP) {
              x.c = x.e = null;

            // Underflow? Zero.
            } else if (x.e < MIN_EXP) {
              x.c = [x.e = 0];
            }
          }

          return x;
        }


        function valueOf(n) {
          var str,
            e = n.e;

          if (e === null) return n.toString();

          str = coeffToString(n.c);

          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
            ? toExponential(str, e)
            : toFixedPoint(str, e, '0');

          return n.s < 0 ? '-' + str : str;
        }


        // PROTOTYPE/INSTANCE METHODS


        /*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */
        P.absoluteValue = P.abs = function () {
          var x = new BigNumber(this);
          if (x.s < 0) x.s = 1;
          return x;
        };


        /*
         * Return
         *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         *   0 if they have the same value,
         *   or null if the value of either is NaN.
         */
        P.comparedTo = function (y, b) {
          return compare(this, new BigNumber(y, b));
        };


        /*
         * If dp is undefined or null or true or false, return the number of decimal places of the
         * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
         *
         * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
         * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
         * ROUNDING_MODE if rm is omitted.
         *
         * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
         */
        P.decimalPlaces = P.dp = function (dp, rm) {
          var c, n, v,
            x = this;

          if (dp != null) {
            intCheck(dp, 0, MAX);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);

            return round(new BigNumber(x), dp + x.e + 1, rm);
          }

          if (!(c = x.c)) return null;
          n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

          // Subtract the number of trailing zeros of the last number.
          if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
          if (n < 0) n = 0;

          return n;
        };


        /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.dividedBy = P.div = function (y, b) {
          return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
        };


        /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */
        P.dividedToIntegerBy = P.idiv = function (y, b) {
          return div(this, new BigNumber(y, b), 0, 1);
        };


        /*
         * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
         *
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are integers, otherwise it
         * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
         *
         * n {number|string|BigNumber} The exponent. An integer.
         * [m] {number|string|BigNumber} The modulus.
         *
         * '[BigNumber Error] Exponent not an integer: {n}'
         */
        P.exponentiatedBy = P.pow = function (n, m) {
          var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
            x = this;

          n = new BigNumber(n);

          // Allow NaN and ±Infinity, but not other non-integers.
          if (n.c && !n.isInteger()) {
            throw Error
              (bignumberError + 'Exponent not an integer: ' + valueOf(n));
          }

          if (m != null) m = new BigNumber(m);

          // Exponent of MAX_SAFE_INTEGER is 15.
          nIsBig = n.e > 14;

          // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
          if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

            // The sign of the result of pow when x is negative depends on the evenness of n.
            // If +n overflows to ±Infinity, the evenness of n would be not be known.
            y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
            return m ? y.mod(m) : y;
          }

          nIsNeg = n.s < 0;

          if (m) {

            // x % m returns NaN if abs(m) is zero, or m is NaN.
            if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

            isModExp = !nIsNeg && x.isInteger() && m.isInteger();

            if (isModExp) x = x.mod(m);

          // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
          // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
          } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
            // [1, 240000000]
            ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
            // [80000000000000]  [99999750000000]
            : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

            // If x is negative and n is odd, k = -0, else k = 0.
            k = x.s < 0 && isOdd(n) ? -0 : 0;

            // If x >= 1, k = ±Infinity.
            if (x.e > -1) k = 1 / k;

            // If n is negative return ±0, else return ±Infinity.
            return new BigNumber(nIsNeg ? 1 / k : k);

          } else if (POW_PRECISION) {

            // Truncating each coefficient array to a length of k after each multiplication
            // equates to truncating significant digits to POW_PRECISION + [28, 41],
            // i.e. there will be a minimum of 28 guard digits retained.
            k = mathceil(POW_PRECISION / LOG_BASE + 2);
          }

          if (nIsBig) {
            half = new BigNumber(0.5);
            if (nIsNeg) n.s = 1;
            nIsOdd = isOdd(n);
          } else {
            i = Math.abs(+valueOf(n));
            nIsOdd = i % 2;
          }

          y = new BigNumber(ONE);

          // Performs 54 loop iterations for n of 9007199254740991.
          for (; ;) {

            if (nIsOdd) {
              y = y.times(x);
              if (!y.c) break;

              if (k) {
                if (y.c.length > k) y.c.length = k;
              } else if (isModExp) {
                y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
              }
            }

            if (i) {
              i = mathfloor(i / 2);
              if (i === 0) break;
              nIsOdd = i % 2;
            } else {
              n = n.times(half);
              round(n, n.e + 1, 1);

              if (n.e > 14) {
                nIsOdd = isOdd(n);
              } else {
                i = +valueOf(n);
                if (i === 0) break;
                nIsOdd = i % 2;
              }
            }

            x = x.times(x);

            if (k) {
              if (x.c && x.c.length > k) x.c.length = k;
            } else if (isModExp) {
              x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
            }
          }

          if (isModExp) return y;
          if (nIsNeg) y = ONE.div(y);

          return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
         * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
         */
        P.integerValue = function (rm) {
          var n = new BigNumber(this);
          if (rm == null) rm = ROUNDING_MODE;
          else intCheck(rm, 0, 8);
          return round(n, n.e + 1, rm);
        };


        /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise return false.
         */
        P.isEqualTo = P.eq = function (y, b) {
          return compare(this, new BigNumber(y, b)) === 0;
        };


        /*
         * Return true if the value of this BigNumber is a finite number, otherwise return false.
         */
        P.isFinite = function () {
          return !!this.c;
        };


        /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise return false.
         */
        P.isGreaterThan = P.gt = function (y, b) {
          return compare(this, new BigNumber(y, b)) > 0;
        };


        /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise return false.
         */
        P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
          return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

        };


        /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */
        P.isInteger = function () {
          return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
        };


        /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise return false.
         */
        P.isLessThan = P.lt = function (y, b) {
          return compare(this, new BigNumber(y, b)) < 0;
        };


        /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise return false.
         */
        P.isLessThanOrEqualTo = P.lte = function (y, b) {
          return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
        };


        /*
         * Return true if the value of this BigNumber is NaN, otherwise return false.
         */
        P.isNaN = function () {
          return !this.s;
        };


        /*
         * Return true if the value of this BigNumber is negative, otherwise return false.
         */
        P.isNegative = function () {
          return this.s < 0;
        };


        /*
         * Return true if the value of this BigNumber is positive, otherwise return false.
         */
        P.isPositive = function () {
          return this.s > 0;
        };


        /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
         */
        P.isZero = function () {
          return !!this.c && this.c[0] == 0;
        };


        /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */
        P.minus = function (y, b) {
          var i, j, t, xLTy,
            x = this,
            a = x.s;

          y = new BigNumber(y, b);
          b = y.s;

          // Either NaN?
          if (!a || !b) return new BigNumber(NaN);

          // Signs differ?
          if (a != b) {
            y.s = -b;
            return x.plus(y);
          }

          var xe = x.e / LOG_BASE,
            ye = y.e / LOG_BASE,
            xc = x.c,
            yc = y.c;

          if (!xe || !ye) {

            // Either Infinity?
            if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

            // Either zero?
            if (!xc[0] || !yc[0]) {

              // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
              return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

               // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
               ROUNDING_MODE == 3 ? -0 : 0);
            }
          }

          xe = bitFloor(xe);
          ye = bitFloor(ye);
          xc = xc.slice();

          // Determine which is the bigger number.
          if (a = xe - ye) {

            if (xLTy = a < 0) {
              a = -a;
              t = xc;
            } else {
              ye = xe;
              t = yc;
            }

            t.reverse();

            // Prepend zeros to equalise exponents.
            for (b = a; b--; t.push(0));
            t.reverse();
          } else {

            // Exponents equal. Check digit by digit.
            j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

            for (a = b = 0; b < j; b++) {

              if (xc[b] != yc[b]) {
                xLTy = xc[b] < yc[b];
                break;
              }
            }
          }

          // x < y? Point xc to the array of the bigger number.
          if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

          b = (j = yc.length) - (i = xc.length);

          // Append zeros to xc if shorter.
          // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
          if (b > 0) for (; b--; xc[i++] = 0);
          b = BASE - 1;

          // Subtract yc from xc.
          for (; j > a;) {

            if (xc[--j] < yc[j]) {
              for (i = j; i && !xc[--i]; xc[i] = b);
              --xc[i];
              xc[j] += BASE;
            }

            xc[j] -= yc[j];
          }

          // Remove leading zeros and adjust exponent accordingly.
          for (; xc[0] == 0; xc.splice(0, 1), --ye);

          // Zero?
          if (!xc[0]) {

            // Following IEEE 754 (2008) 6.3,
            // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
            y.s = ROUNDING_MODE == 3 ? -1 : 1;
            y.c = [y.e = 0];
            return y;
          }

          // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
          // for finite x and y.
          return normalise(y, xc, ye);
        };


        /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */
        P.modulo = P.mod = function (y, b) {
          var q, s,
            x = this;

          y = new BigNumber(y, b);

          // Return NaN if x is Infinity or NaN, or y is NaN or zero.
          if (!x.c || !y.s || y.c && !y.c[0]) {
            return new BigNumber(NaN);

          // Return x if y is Infinity or x is zero.
          } else if (!y.c || x.c && !x.c[0]) {
            return new BigNumber(x);
          }

          if (MODULO_MODE == 9) {

            // Euclidian division: q = sign(y) * floor(x / abs(y))
            // r = x - qy    where  0 <= r < abs(y)
            s = y.s;
            y.s = 1;
            q = div(x, y, 0, 3);
            y.s = s;
            q.s *= s;
          } else {
            q = div(x, y, 0, MODULO_MODE);
          }

          y = x.minus(q.times(y));

          // To match JavaScript %, ensure sign of zero is sign of dividend.
          if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

          return y;
        };


        /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
         * of BigNumber(y, b).
         */
        P.multipliedBy = P.times = function (y, b) {
          var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
            base, sqrtBase,
            x = this,
            xc = x.c,
            yc = (y = new BigNumber(y, b)).c;

          // Either NaN, ±Infinity or ±0?
          if (!xc || !yc || !xc[0] || !yc[0]) {

            // Return NaN if either is NaN, or one is 0 and the other is Infinity.
            if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
              y.c = y.e = y.s = null;
            } else {
              y.s *= x.s;

              // Return ±Infinity if either is ±Infinity.
              if (!xc || !yc) {
                y.c = y.e = null;

              // Return ±0 if either is ±0.
              } else {
                y.c = [0];
                y.e = 0;
              }
            }

            return y;
          }

          e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
          y.s *= x.s;
          xcL = xc.length;
          ycL = yc.length;

          // Ensure xc points to longer array and xcL to its length.
          if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

          // Initialise the result array with zeros.
          for (i = xcL + ycL, zc = []; i--; zc.push(0));

          base = BASE;
          sqrtBase = SQRT_BASE;

          for (i = ycL; --i >= 0;) {
            c = 0;
            ylo = yc[i] % sqrtBase;
            yhi = yc[i] / sqrtBase | 0;

            for (k = xcL, j = i + k; j > i;) {
              xlo = xc[--k] % sqrtBase;
              xhi = xc[k] / sqrtBase | 0;
              m = yhi * xlo + xhi * ylo;
              xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
              c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
              zc[j--] = xlo % base;
            }

            zc[j] = c;
          }

          if (c) {
            ++e;
          } else {
            zc.splice(0, 1);
          }

          return normalise(y, zc, e);
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */
        P.negated = function () {
          var x = new BigNumber(this);
          x.s = -x.s || null;
          return x;
        };


        /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */
        P.plus = function (y, b) {
          var t,
            x = this,
            a = x.s;

          y = new BigNumber(y, b);
          b = y.s;

          // Either NaN?
          if (!a || !b) return new BigNumber(NaN);

          // Signs differ?
           if (a != b) {
            y.s = -b;
            return x.minus(y);
          }

          var xe = x.e / LOG_BASE,
            ye = y.e / LOG_BASE,
            xc = x.c,
            yc = y.c;

          if (!xe || !ye) {

            // Return ±Infinity if either ±Infinity.
            if (!xc || !yc) return new BigNumber(a / 0);

            // Either zero?
            // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
            if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
          }

          xe = bitFloor(xe);
          ye = bitFloor(ye);
          xc = xc.slice();

          // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
          if (a = xe - ye) {
            if (a > 0) {
              ye = xe;
              t = yc;
            } else {
              a = -a;
              t = xc;
            }

            t.reverse();
            for (; a--; t.push(0));
            t.reverse();
          }

          a = xc.length;
          b = yc.length;

          // Point xc to the longer array, and b to the shorter length.
          if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

          // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
          for (a = 0; b;) {
            a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
            xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
          }

          if (a) {
            xc = [a].concat(xc);
            ++ye;
          }

          // No need to check for zero, as +x + +y != 0 && -x + -y != 0
          // ye = MAX_EXP + 1 possible
          return normalise(y, xc, ye);
        };


        /*
         * If sd is undefined or null or true or false, return the number of significant digits of
         * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
         * If sd is true include integer-part trailing zeros in the count.
         *
         * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
         * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
         * ROUNDING_MODE if rm is omitted.
         *
         * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
         *                     boolean: whether to count integer-part trailing zeros: true or false.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
         */
        P.precision = P.sd = function (sd, rm) {
          var c, n, v,
            x = this;

          if (sd != null && sd !== !!sd) {
            intCheck(sd, 1, MAX);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);

            return round(new BigNumber(x), sd, rm);
          }

          if (!(c = x.c)) return null;
          v = c.length - 1;
          n = v * LOG_BASE + 1;

          if (v = c[v]) {

            // Subtract the number of trailing zeros of the last element.
            for (; v % 10 == 0; v /= 10, n--);

            // Add the number of digits of the first element.
            for (v = c[0]; v >= 10; v /= 10, n++);
          }

          if (sd && x.e + 1 > n) n = x.e + 1;

          return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
         */
        P.shiftedBy = function (k) {
          intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
          return this.times('1e' + k);
        };


        /*
         *  sqrt(-n) =  N
         *  sqrt(N) =  N
         *  sqrt(-I) =  N
         *  sqrt(I) =  I
         *  sqrt(0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.squareRoot = P.sqrt = function () {
          var m, n, r, rep, t,
            x = this,
            c = x.c,
            s = x.s,
            e = x.e,
            dp = DECIMAL_PLACES + 4,
            half = new BigNumber('0.5');

          // Negative/NaN/Infinity/zero?
          if (s !== 1 || !c || !c[0]) {
            return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
          }

          // Initial estimate.
          s = Math.sqrt(+valueOf(x));

          // Math.sqrt underflow/overflow?
          // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
          if (s == 0 || s == 1 / 0) {
            n = coeffToString(c);
            if ((n.length + e) % 2 == 0) n += '0';
            s = Math.sqrt(+n);
            e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

            if (s == 1 / 0) {
              n = '5e' + e;
            } else {
              n = s.toExponential();
              n = n.slice(0, n.indexOf('e') + 1) + e;
            }

            r = new BigNumber(n);
          } else {
            r = new BigNumber(s + '');
          }

          // Check for zero.
          // r could be zero if MIN_EXP is changed after the this value was created.
          // This would cause a division by zero (x/t) and hence Infinity below, which would cause
          // coeffToString to throw.
          if (r.c[0]) {
            e = r.e;
            s = e + dp;
            if (s < 3) s = 0;

            // Newton-Raphson iteration.
            for (; ;) {
              t = r;
              r = half.times(t.plus(div(x, t, dp, 1)));

              if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

                // The exponent of r may here be one less than the final result exponent,
                // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
                // are indexed correctly.
                if (r.e < e) --s;
                n = n.slice(s - 3, s + 1);

                // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
                // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
                // iteration.
                if (n == '9999' || !rep && n == '4999') {

                  // On the first iteration only, check to see if rounding up gives the
                  // exact result as the nines may infinitely repeat.
                  if (!rep) {
                    round(t, t.e + DECIMAL_PLACES + 2, 0);

                    if (t.times(t).eq(x)) {
                      r = t;
                      break;
                    }
                  }

                  dp += 4;
                  s += 4;
                  rep = 1;
                } else {

                  // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
                  // result. If not, then there are further digits and m will be truthy.
                  if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

                    // Truncate to the first rounding digit.
                    round(r, r.e + DECIMAL_PLACES + 2, 1);
                    m = !r.times(r).eq(x);
                  }

                  break;
                }
              }
            }
          }

          return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
        };


        /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
         */
        P.toExponential = function (dp, rm) {
          if (dp != null) {
            intCheck(dp, 0, MAX);
            dp++;
          }
          return format(this, dp, rm, 1);
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
         */
        P.toFixed = function (dp, rm) {
          if (dp != null) {
            intCheck(dp, 0, MAX);
            dp = dp + this.e + 1;
          }
          return format(this, dp, rm);
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the format or FORMAT object (see BigNumber.set).
         *
         * The formatting object may contain some or all of the properties shown below.
         *
         * FORMAT = {
         *   prefix: '',
         *   groupSize: 3,
         *   secondaryGroupSize: 0,
         *   groupSeparator: ',',
         *   decimalSeparator: '.',
         *   fractionGroupSize: 0,
         *   fractionGroupSeparator: '\xA0',      // non-breaking space
         *   suffix: ''
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         * [format] {object} Formatting options. See FORMAT pbject above.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
         * '[BigNumber Error] Argument not an object: {format}'
         */
        P.toFormat = function (dp, rm, format) {
          var str,
            x = this;

          if (format == null) {
            if (dp != null && rm && typeof rm == 'object') {
              format = rm;
              rm = null;
            } else if (dp && typeof dp == 'object') {
              format = dp;
              dp = rm = null;
            } else {
              format = FORMAT;
            }
          } else if (typeof format != 'object') {
            throw Error
              (bignumberError + 'Argument not an object: ' + format);
          }

          str = x.toFixed(dp, rm);

          if (x.c) {
            var i,
              arr = str.split('.'),
              g1 = +format.groupSize,
              g2 = +format.secondaryGroupSize,
              groupSeparator = format.groupSeparator || '',
              intPart = arr[0],
              fractionPart = arr[1],
              isNeg = x.s < 0,
              intDigits = isNeg ? intPart.slice(1) : intPart,
              len = intDigits.length;

            if (g2) i = g1, g1 = g2, g2 = i, len -= i;

            if (g1 > 0 && len > 0) {
              i = len % g1 || g1;
              intPart = intDigits.substr(0, i);
              for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
              if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
              if (isNeg) intPart = '-' + intPart;
            }

            str = fractionPart
             ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
              ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
               '$&' + (format.fractionGroupSeparator || ''))
              : fractionPart)
             : intPart;
          }

          return (format.prefix || '') + str + (format.suffix || '');
        };


        /*
         * Return an array of two BigNumbers representing the value of this BigNumber as a simple
         * fraction with an integer numerator and an integer denominator.
         * The denominator will be a positive non-zero value less than or equal to the specified
         * maximum denominator. If a maximum denominator is not specified, the denominator will be
         * the lowest value necessary to represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
         *
         * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
         */
        P.toFraction = function (md) {
          var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
            x = this,
            xc = x.c;

          if (md != null) {
            n = new BigNumber(md);

            // Throw if md is less than one or is not an integer, unless it is Infinity.
            if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
              throw Error
                (bignumberError + 'Argument ' +
                  (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
            }
          }

          if (!xc) return new BigNumber(x);

          d = new BigNumber(ONE);
          n1 = d0 = new BigNumber(ONE);
          d1 = n0 = new BigNumber(ONE);
          s = coeffToString(xc);

          // Determine initial denominator.
          // d is a power of 10 and the minimum max denominator that specifies the value exactly.
          e = d.e = s.length - x.e - 1;
          d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
          md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

          exp = MAX_EXP;
          MAX_EXP = 1 / 0;
          n = new BigNumber(s);

          // n0 = d1 = 0
          n0.c[0] = 0;

          for (; ;)  {
            q = div(n, d, 0, 1);
            d2 = d0.plus(q.times(d1));
            if (d2.comparedTo(md) == 1) break;
            d0 = d1;
            d1 = d2;
            n1 = n0.plus(q.times(d2 = n1));
            n0 = d2;
            d = n.minus(q.times(d2 = d));
            n = d2;
          }

          d2 = div(md.minus(d0), d1, 0, 1);
          n0 = n0.plus(d2.times(n1));
          d0 = d0.plus(d2.times(d1));
          n0.s = n1.s = x.s;
          e = e * 2;

          // Determine which fraction is closer to x, n0/d0 or n1/d1
          r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
              div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

          MAX_EXP = exp;

          return r;
        };


        /*
         * Return the value of this BigNumber converted to a number primitive.
         */
        P.toNumber = function () {
          return +valueOf(this);
        };


        /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
         */
        P.toPrecision = function (sd, rm) {
          if (sd != null) intCheck(sd, 1, MAX);
          return format(this, sd, rm, 2);
        };


        /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to ALPHABET.length inclusive.
         *
         * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
         */
        P.toString = function (b) {
          var str,
            n = this,
            s = n.s,
            e = n.e;

          // Infinity or NaN?
          if (e === null) {
            if (s) {
              str = 'Infinity';
              if (s < 0) str = '-' + str;
            } else {
              str = 'NaN';
            }
          } else {
            if (b == null) {
              str = e <= TO_EXP_NEG || e >= TO_EXP_POS
               ? toExponential(coeffToString(n.c), e)
               : toFixedPoint(coeffToString(n.c), e, '0');
            } else if (b === 10 && alphabetHasNormalDecimalDigits) {
              n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
              str = toFixedPoint(coeffToString(n.c), n.e, '0');
            } else {
              intCheck(b, 2, ALPHABET.length, 'Base');
              str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
            }

            if (s < 0 && n.c[0]) str = '-' + str;
          }

          return str;
        };


        /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */
        P.valueOf = P.toJSON = function () {
          return valueOf(this);
        };


        P._isBigNumber = true;

        if (configObject != null) BigNumber.set(configObject);

        return BigNumber;
      }


      // PRIVATE HELPER FUNCTIONS

      // These functions don't need access to variables,
      // e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


      function bitFloor(n) {
        var i = n | 0;
        return n > 0 || n === i ? i : i - 1;
      }


      // Return a coefficient array as a string of base 10 digits.
      function coeffToString(a) {
        var s, z,
          i = 1,
          j = a.length,
          r = a[0] + '';

        for (; i < j;) {
          s = a[i++] + '';
          z = LOG_BASE - s.length;
          for (; z--; s = '0' + s);
          r += s;
        }

        // Determine trailing zeros.
        for (j = r.length; r.charCodeAt(--j) === 48;);

        return r.slice(0, j + 1 || 1);
      }


      // Compare the value of BigNumbers x and y.
      function compare(x, y) {
        var a, b,
          xc = x.c,
          yc = y.c,
          i = x.s,
          j = y.s,
          k = x.e,
          l = y.e;

        // Either NaN?
        if (!i || !j) return null;

        a = xc && !xc[0];
        b = yc && !yc[0];

        // Either zero?
        if (a || b) return a ? b ? 0 : -j : i;

        // Signs differ?
        if (i != j) return i;

        a = i < 0;
        b = k == l;

        // Either Infinity?
        if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

        // Compare exponents.
        if (!b) return k > l ^ a ? 1 : -1;

        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

        // Compare lengths.
        return k == l ? 0 : k > l ^ a ? 1 : -1;
      }


      /*
       * Check that n is a primitive number, an integer, and in range, otherwise throw.
       */
      function intCheck(n, min, max, name) {
        if (n < min || n > max || n !== mathfloor(n)) {
          throw Error
           (bignumberError + (name || 'Argument') + (typeof n == 'number'
             ? n < min || n > max ? ' out of range: ' : ' not an integer: '
             : ' not a primitive number: ') + String(n));
        }
      }


      // Assumes finite n.
      function isOdd(n) {
        var k = n.c.length - 1;
        return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
      }


      function toExponential(str, e) {
        return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
         (e < 0 ? 'e' : 'e+') + e;
      }


      function toFixedPoint(str, e, z) {
        var len, zs;

        // Negative exponent?
        if (e < 0) {

          // Prepend zeros.
          for (zs = z + '.'; ++e; zs += z);
          str = zs + str;

        // Positive exponent
        } else {
          len = str.length;

          // Append zeros.
          if (++e > len) {
            for (zs = z, e -= len; --e; zs += z);
            str += zs;
          } else if (e < len) {
            str = str.slice(0, e) + '.' + str.slice(e);
          }
        }

        return str;
      }


      // EXPORT


      BigNumber = clone();
      BigNumber['default'] = BigNumber.BigNumber = BigNumber;

      // AMD.
      if (module.exports) {
        module.exports = BigNumber;

      // Browser.
      } else {
        if (!globalObject) {
          globalObject = typeof self != 'undefined' && self ? self : window;
        }

        globalObject.BigNumber = BigNumber;
      }
    })(commonjsGlobal);
    }(bignumber));

    /* eslint-disable */

    var decoder_asm = function decodeAsm (stdlib, foreign, buffer) {
      'use asm';

      // -- Imports

      var heap = new stdlib.Uint8Array(buffer);
      // var log = foreign.log
      var pushInt = foreign.pushInt;
      var pushInt32 = foreign.pushInt32;
      var pushInt32Neg = foreign.pushInt32Neg;
      var pushInt64 = foreign.pushInt64;
      var pushInt64Neg = foreign.pushInt64Neg;
      var pushFloat = foreign.pushFloat;
      var pushFloatSingle = foreign.pushFloatSingle;
      var pushFloatDouble = foreign.pushFloatDouble;
      var pushTrue = foreign.pushTrue;
      var pushFalse = foreign.pushFalse;
      var pushUndefined = foreign.pushUndefined;
      var pushNull = foreign.pushNull;
      var pushInfinity = foreign.pushInfinity;
      var pushInfinityNeg = foreign.pushInfinityNeg;
      var pushNaN = foreign.pushNaN;
      var pushNaNNeg = foreign.pushNaNNeg;

      var pushArrayStart = foreign.pushArrayStart;
      var pushArrayStartFixed = foreign.pushArrayStartFixed;
      var pushArrayStartFixed32 = foreign.pushArrayStartFixed32;
      var pushArrayStartFixed64 = foreign.pushArrayStartFixed64;
      var pushObjectStart = foreign.pushObjectStart;
      var pushObjectStartFixed = foreign.pushObjectStartFixed;
      var pushObjectStartFixed32 = foreign.pushObjectStartFixed32;
      var pushObjectStartFixed64 = foreign.pushObjectStartFixed64;

      var pushByteString = foreign.pushByteString;
      var pushByteStringStart = foreign.pushByteStringStart;
      var pushUtf8String = foreign.pushUtf8String;
      var pushUtf8StringStart = foreign.pushUtf8StringStart;

      var pushSimpleUnassigned = foreign.pushSimpleUnassigned;

      var pushTagStart = foreign.pushTagStart;
      var pushTagStart4 = foreign.pushTagStart4;
      var pushTagStart8 = foreign.pushTagStart8;
      var pushTagUnassigned = foreign.pushTagUnassigned;

      var pushBreak = foreign.pushBreak;

      var pow = stdlib.Math.pow;

      // -- Constants


      // -- Mutable Variables

      var offset = 0;
      var inputLength = 0;
      var code = 0;

      // Decode a cbor string represented as Uint8Array
      // which is allocated on the heap from 0 to inputLength
      //
      // input - Int
      //
      // Returns Code - Int,
      // Success = 0
      // Error > 0
      function parse (input) {
        input = input | 0;

        offset = 0;
        inputLength = input;

        while ((offset | 0) < (inputLength | 0)) {
          code = jumpTable[heap[offset] & 255](heap[offset] | 0) | 0;

          if ((code | 0) > 0) {
            break
          }
        }

        return code | 0
      }

      // -- Helper Function

      function checkOffset (n) {
        n = n | 0;

        if ((((offset | 0) + (n | 0)) | 0) < (inputLength | 0)) {
          return 0
        }

        return 1
      }

      function readUInt16 (n) {
        n = n | 0;

        return (
          (heap[n | 0] << 8) | heap[(n + 1) | 0]
        ) | 0
      }

      function readUInt32 (n) {
        n = n | 0;

        return (
          (heap[n | 0] << 24) | (heap[(n + 1) | 0] << 16) | (heap[(n + 2) | 0] << 8) | heap[(n + 3) | 0]
        ) | 0
      }

      // -- Initial Byte Handlers

      function INT_P (octet) {
        octet = octet | 0;

        pushInt(octet | 0);

        offset = (offset + 1) | 0;

        return 0
      }

      function UINT_P_8 (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushInt(heap[(offset + 1) | 0] | 0);

        offset = (offset + 2) | 0;

        return 0
      }

      function UINT_P_16 (octet) {
        octet = octet | 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        pushInt(
          readUInt16((offset + 1) | 0) | 0
        );

        offset = (offset + 3) | 0;

        return 0
      }

      function UINT_P_32 (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushInt32(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0
        );

        offset = (offset + 5) | 0;

        return 0
      }

      function UINT_P_64 (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushInt64(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0,
          readUInt16((offset + 5) | 0) | 0,
          readUInt16((offset + 7) | 0) | 0
        );

        offset = (offset + 9) | 0;

        return 0
      }

      function INT_N (octet) {
        octet = octet | 0;

        pushInt((-1 - ((octet - 32) | 0)) | 0);

        offset = (offset + 1) | 0;

        return 0
      }

      function UINT_N_8 (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushInt(
          (-1 - (heap[(offset + 1) | 0] | 0)) | 0
        );

        offset = (offset + 2) | 0;

        return 0
      }

      function UINT_N_16 (octet) {
        octet = octet | 0;

        var val = 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        val = readUInt16((offset + 1) | 0) | 0;
        pushInt((-1 - (val | 0)) | 0);

        offset = (offset + 3) | 0;

        return 0
      }

      function UINT_N_32 (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushInt32Neg(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0
        );

        offset = (offset + 5) | 0;

        return 0
      }

      function UINT_N_64 (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushInt64Neg(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0,
          readUInt16((offset + 5) | 0) | 0,
          readUInt16((offset + 7) | 0) | 0
        );

        offset = (offset + 9) | 0;

        return 0
      }

      function BYTE_STRING (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var step = 0;

        step = (octet - 64) | 0;
        if (checkOffset(step | 0) | 0) {
          return 1
        }

        start = (offset + 1) | 0;
        end = (((offset + 1) | 0) + (step | 0)) | 0;

        pushByteString(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function BYTE_STRING_8 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        length = heap[(offset + 1) | 0] | 0;
        start = (offset + 2) | 0;
        end = (((offset + 2) | 0) + (length | 0)) | 0;

        if (checkOffset((length + 1) | 0) | 0) {
          return 1
        }

        pushByteString(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function BYTE_STRING_16 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        length = readUInt16((offset + 1) | 0) | 0;
        start = (offset + 3) | 0;
        end = (((offset + 3) | 0) + (length | 0)) | 0;


        if (checkOffset((length + 2) | 0) | 0) {
          return 1
        }

        pushByteString(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function BYTE_STRING_32 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        length = readUInt32((offset + 1) | 0) | 0;
        start = (offset + 5) | 0;
        end = (((offset + 5) | 0) + (length | 0)) | 0;


        if (checkOffset((length + 4) | 0) | 0) {
          return 1
        }

        pushByteString(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function BYTE_STRING_64 (octet) {
        // NOT IMPLEMENTED
        octet = octet | 0;

        return 1
      }

      function BYTE_STRING_BREAK (octet) {
        octet = octet | 0;

        pushByteStringStart();

        offset = (offset + 1) | 0;

        return 0
      }

      function UTF8_STRING (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var step = 0;

        step = (octet - 96) | 0;

        if (checkOffset(step | 0) | 0) {
          return 1
        }

        start = (offset + 1) | 0;
        end = (((offset + 1) | 0) + (step | 0)) | 0;

        pushUtf8String(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function UTF8_STRING_8 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        length = heap[(offset + 1) | 0] | 0;
        start = (offset + 2) | 0;
        end = (((offset + 2) | 0) + (length | 0)) | 0;

        if (checkOffset((length + 1) | 0) | 0) {
          return 1
        }

        pushUtf8String(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function UTF8_STRING_16 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        length = readUInt16((offset + 1) | 0) | 0;
        start = (offset + 3) | 0;
        end = (((offset + 3) | 0) + (length | 0)) | 0;

        if (checkOffset((length + 2) | 0) | 0) {
          return 1
        }

        pushUtf8String(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function UTF8_STRING_32 (octet) {
        octet = octet | 0;

        var start = 0;
        var end = 0;
        var length = 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        length = readUInt32((offset + 1) | 0) | 0;
        start = (offset + 5) | 0;
        end = (((offset + 5) | 0) + (length | 0)) | 0;

        if (checkOffset((length + 4) | 0) | 0) {
          return 1
        }

        pushUtf8String(start | 0, end | 0);

        offset = end | 0;

        return 0
      }

      function UTF8_STRING_64 (octet) {
        // NOT IMPLEMENTED
        octet = octet | 0;

        return 1
      }

      function UTF8_STRING_BREAK (octet) {
        octet = octet | 0;

        pushUtf8StringStart();

        offset = (offset + 1) | 0;

        return 0
      }

      function ARRAY (octet) {
        octet = octet | 0;

        pushArrayStartFixed((octet - 128) | 0);

        offset = (offset + 1) | 0;

        return 0
      }

      function ARRAY_8 (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushArrayStartFixed(heap[(offset + 1) | 0] | 0);

        offset = (offset + 2) | 0;

        return 0
      }

      function ARRAY_16 (octet) {
        octet = octet | 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        pushArrayStartFixed(
          readUInt16((offset + 1) | 0) | 0
        );

        offset = (offset + 3) | 0;

        return 0
      }

      function ARRAY_32 (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushArrayStartFixed32(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0
        );

        offset = (offset + 5) | 0;

        return 0
      }

      function ARRAY_64 (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushArrayStartFixed64(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0,
          readUInt16((offset + 5) | 0) | 0,
          readUInt16((offset + 7) | 0) | 0
        );

        offset = (offset + 9) | 0;

        return 0
      }

      function ARRAY_BREAK (octet) {
        octet = octet | 0;

        pushArrayStart();

        offset = (offset + 1) | 0;

        return 0
      }

      function MAP (octet) {
        octet = octet | 0;

        var step = 0;

        step = (octet - 160) | 0;

        if (checkOffset(step | 0) | 0) {
          return 1
        }

        pushObjectStartFixed(step | 0);

        offset = (offset + 1) | 0;

        return 0
      }

      function MAP_8 (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushObjectStartFixed(heap[(offset + 1) | 0] | 0);

        offset = (offset + 2) | 0;

        return 0
      }

      function MAP_16 (octet) {
        octet = octet | 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        pushObjectStartFixed(
          readUInt16((offset + 1) | 0) | 0
        );

        offset = (offset + 3) | 0;

        return 0
      }

      function MAP_32 (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushObjectStartFixed32(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0
        );

        offset = (offset + 5) | 0;

        return 0
      }

      function MAP_64 (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushObjectStartFixed64(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0,
          readUInt16((offset + 5) | 0) | 0,
          readUInt16((offset + 7) | 0) | 0
        );

        offset = (offset + 9) | 0;

        return 0
      }

      function MAP_BREAK (octet) {
        octet = octet | 0;

        pushObjectStart();

        offset = (offset + 1) | 0;

        return 0
      }

      function TAG_KNOWN (octet) {
        octet = octet | 0;

        pushTagStart((octet - 192| 0) | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BIGNUM_POS (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BIGNUM_NEG (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_FRAC (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BIGNUM_FLOAT (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_UNASSIGNED (octet) {
        octet = octet | 0;

        pushTagStart((octet - 192| 0) | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BASE64_URL (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BASE64 (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_BASE16 (octet) {
        octet = octet | 0;

        pushTagStart(octet | 0);

        offset = (offset + 1 | 0);

        return 0
      }

      function TAG_MORE_1 (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushTagStart(heap[(offset + 1) | 0] | 0);

        offset = (offset + 2 | 0);

        return 0
      }

      function TAG_MORE_2 (octet) {
        octet = octet | 0;

        if (checkOffset(2) | 0) {
          return 1
        }

        pushTagStart(
          readUInt16((offset + 1) | 0) | 0
        );

        offset = (offset + 3 | 0);

        return 0
      }

      function TAG_MORE_4 (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushTagStart4(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0
        );

        offset = (offset + 5 | 0);

        return 0
      }

      function TAG_MORE_8 (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushTagStart8(
          readUInt16((offset + 1) | 0) | 0,
          readUInt16((offset + 3) | 0) | 0,
          readUInt16((offset + 5) | 0) | 0,
          readUInt16((offset + 7) | 0) | 0
        );

        offset = (offset + 9 | 0);

        return 0
      }

      function SIMPLE_UNASSIGNED (octet) {
        octet = octet | 0;

        pushSimpleUnassigned(((octet | 0) - 224) | 0);

        offset = (offset + 1) | 0;

        return 0
      }

      function SIMPLE_FALSE (octet) {
        octet = octet | 0;

        pushFalse();

        offset = (offset + 1) | 0;

        return 0
      }

      function SIMPLE_TRUE (octet) {
        octet = octet | 0;

        pushTrue();

        offset = (offset + 1) | 0;

        return 0
      }

      function SIMPLE_NULL (octet) {
        octet = octet | 0;

        pushNull();

        offset = (offset + 1) | 0;

        return 0
      }

      function SIMPLE_UNDEFINED (octet) {
        octet = octet | 0;

        pushUndefined();

        offset = (offset + 1) | 0;

        return 0
      }

      function SIMPLE_BYTE (octet) {
        octet = octet | 0;

        if (checkOffset(1) | 0) {
          return 1
        }

        pushSimpleUnassigned(heap[(offset + 1) | 0] | 0);

        offset = (offset + 2)  | 0;

        return 0
      }

      function SIMPLE_FLOAT_HALF (octet) {
        octet = octet | 0;

        var f = 0;
        var g = 0;
        var sign = 1.0;
        var exp = 0.0;
        var mant = 0.0;
        var r = 0.0;
        if (checkOffset(2) | 0) {
          return 1
        }

        f = heap[(offset + 1) | 0] | 0;
        g = heap[(offset + 2) | 0] | 0;

        if ((f | 0) & 0x80) {
          sign = -1.0;
        }

        exp = +(((f | 0) & 0x7C) >> 2);
        mant = +((((f | 0) & 0x03) << 8) | g);

        if (+exp == 0.0) {
          pushFloat(+(
            (+sign) * +5.9604644775390625e-8 * (+mant)
          ));
        } else if (+exp == 31.0) {
          if (+sign == 1.0) {
            if (+mant > 0.0) {
              pushNaN();
            } else {
              pushInfinity();
            }
          } else {
            if (+mant > 0.0) {
              pushNaNNeg();
            } else {
              pushInfinityNeg();
            }
          }
        } else {
          pushFloat(+(
            +sign * pow(+2, +(+exp - 25.0)) * +(1024.0 + mant)
          ));
        }

        offset = (offset + 3) | 0;

        return 0
      }

      function SIMPLE_FLOAT_SINGLE (octet) {
        octet = octet | 0;

        if (checkOffset(4) | 0) {
          return 1
        }

        pushFloatSingle(
          heap[(offset + 1) | 0] | 0,
          heap[(offset + 2) | 0] | 0,
          heap[(offset + 3) | 0] | 0,
          heap[(offset + 4) | 0] | 0
        );

        offset = (offset + 5) | 0;

        return 0
      }

      function SIMPLE_FLOAT_DOUBLE (octet) {
        octet = octet | 0;

        if (checkOffset(8) | 0) {
          return 1
        }

        pushFloatDouble(
          heap[(offset + 1) | 0] | 0,
          heap[(offset + 2) | 0] | 0,
          heap[(offset + 3) | 0] | 0,
          heap[(offset + 4) | 0] | 0,
          heap[(offset + 5) | 0] | 0,
          heap[(offset + 6) | 0] | 0,
          heap[(offset + 7) | 0] | 0,
          heap[(offset + 8) | 0] | 0
        );

        offset = (offset + 9) | 0;

        return 0
      }

      function ERROR (octet) {
        octet = octet | 0;

        return 1
      }

      function BREAK (octet) {
        octet = octet | 0;

        pushBreak();

        offset = (offset + 1) | 0;

        return 0
      }

      // -- Jump Table

      var jumpTable = [
        // Integer 0x00..0x17 (0..23)
        INT_P, // 0x00
        INT_P, // 0x01
        INT_P, // 0x02
        INT_P, // 0x03
        INT_P, // 0x04
        INT_P, // 0x05
        INT_P, // 0x06
        INT_P, // 0x07
        INT_P, // 0x08
        INT_P, // 0x09
        INT_P, // 0x0A
        INT_P, // 0x0B
        INT_P, // 0x0C
        INT_P, // 0x0D
        INT_P, // 0x0E
        INT_P, // 0x0F
        INT_P, // 0x10
        INT_P, // 0x11
        INT_P, // 0x12
        INT_P, // 0x13
        INT_P, // 0x14
        INT_P, // 0x15
        INT_P, // 0x16
        INT_P, // 0x17
        // Unsigned integer (one-byte uint8_t follows)
        UINT_P_8, // 0x18
        // Unsigned integer (two-byte uint16_t follows)
        UINT_P_16, // 0x19
        // Unsigned integer (four-byte uint32_t follows)
        UINT_P_32, // 0x1a
        // Unsigned integer (eight-byte uint64_t follows)
        UINT_P_64, // 0x1b
        ERROR, // 0x1c
        ERROR, // 0x1d
        ERROR, // 0x1e
        ERROR, // 0x1f
        // Negative integer -1-0x00..-1-0x17 (-1..-24)
        INT_N, // 0x20
        INT_N, // 0x21
        INT_N, // 0x22
        INT_N, // 0x23
        INT_N, // 0x24
        INT_N, // 0x25
        INT_N, // 0x26
        INT_N, // 0x27
        INT_N, // 0x28
        INT_N, // 0x29
        INT_N, // 0x2A
        INT_N, // 0x2B
        INT_N, // 0x2C
        INT_N, // 0x2D
        INT_N, // 0x2E
        INT_N, // 0x2F
        INT_N, // 0x30
        INT_N, // 0x31
        INT_N, // 0x32
        INT_N, // 0x33
        INT_N, // 0x34
        INT_N, // 0x35
        INT_N, // 0x36
        INT_N, // 0x37
        // Negative integer -1-n (one-byte uint8_t for n follows)
        UINT_N_8, // 0x38
        // Negative integer -1-n (two-byte uint16_t for n follows)
        UINT_N_16, // 0x39
        // Negative integer -1-n (four-byte uint32_t for nfollows)
        UINT_N_32, // 0x3a
        // Negative integer -1-n (eight-byte uint64_t for n follows)
        UINT_N_64, // 0x3b
        ERROR, // 0x3c
        ERROR, // 0x3d
        ERROR, // 0x3e
        ERROR, // 0x3f
        // byte string (0x00..0x17 bytes follow)
        BYTE_STRING, // 0x40
        BYTE_STRING, // 0x41
        BYTE_STRING, // 0x42
        BYTE_STRING, // 0x43
        BYTE_STRING, // 0x44
        BYTE_STRING, // 0x45
        BYTE_STRING, // 0x46
        BYTE_STRING, // 0x47
        BYTE_STRING, // 0x48
        BYTE_STRING, // 0x49
        BYTE_STRING, // 0x4A
        BYTE_STRING, // 0x4B
        BYTE_STRING, // 0x4C
        BYTE_STRING, // 0x4D
        BYTE_STRING, // 0x4E
        BYTE_STRING, // 0x4F
        BYTE_STRING, // 0x50
        BYTE_STRING, // 0x51
        BYTE_STRING, // 0x52
        BYTE_STRING, // 0x53
        BYTE_STRING, // 0x54
        BYTE_STRING, // 0x55
        BYTE_STRING, // 0x56
        BYTE_STRING, // 0x57
        // byte string (one-byte uint8_t for n, and then n bytes follow)
        BYTE_STRING_8, // 0x58
        // byte string (two-byte uint16_t for n, and then n bytes follow)
        BYTE_STRING_16, // 0x59
        // byte string (four-byte uint32_t for n, and then n bytes follow)
        BYTE_STRING_32, // 0x5a
        // byte string (eight-byte uint64_t for n, and then n bytes follow)
        BYTE_STRING_64, // 0x5b
        ERROR, // 0x5c
        ERROR, // 0x5d
        ERROR, // 0x5e
        // byte string, byte strings follow, terminated by "break"
        BYTE_STRING_BREAK, // 0x5f
        // UTF-8 string (0x00..0x17 bytes follow)
        UTF8_STRING, // 0x60
        UTF8_STRING, // 0x61
        UTF8_STRING, // 0x62
        UTF8_STRING, // 0x63
        UTF8_STRING, // 0x64
        UTF8_STRING, // 0x65
        UTF8_STRING, // 0x66
        UTF8_STRING, // 0x67
        UTF8_STRING, // 0x68
        UTF8_STRING, // 0x69
        UTF8_STRING, // 0x6A
        UTF8_STRING, // 0x6B
        UTF8_STRING, // 0x6C
        UTF8_STRING, // 0x6D
        UTF8_STRING, // 0x6E
        UTF8_STRING, // 0x6F
        UTF8_STRING, // 0x70
        UTF8_STRING, // 0x71
        UTF8_STRING, // 0x72
        UTF8_STRING, // 0x73
        UTF8_STRING, // 0x74
        UTF8_STRING, // 0x75
        UTF8_STRING, // 0x76
        UTF8_STRING, // 0x77
        // UTF-8 string (one-byte uint8_t for n, and then n bytes follow)
        UTF8_STRING_8, // 0x78
        // UTF-8 string (two-byte uint16_t for n, and then n bytes follow)
        UTF8_STRING_16, // 0x79
        // UTF-8 string (four-byte uint32_t for n, and then n bytes follow)
        UTF8_STRING_32, // 0x7a
        // UTF-8 string (eight-byte uint64_t for n, and then n bytes follow)
        UTF8_STRING_64, // 0x7b
        // UTF-8 string, UTF-8 strings follow, terminated by "break"
        ERROR, // 0x7c
        ERROR, // 0x7d
        ERROR, // 0x7e
        UTF8_STRING_BREAK, // 0x7f
        // array (0x00..0x17 data items follow)
        ARRAY, // 0x80
        ARRAY, // 0x81
        ARRAY, // 0x82
        ARRAY, // 0x83
        ARRAY, // 0x84
        ARRAY, // 0x85
        ARRAY, // 0x86
        ARRAY, // 0x87
        ARRAY, // 0x88
        ARRAY, // 0x89
        ARRAY, // 0x8A
        ARRAY, // 0x8B
        ARRAY, // 0x8C
        ARRAY, // 0x8D
        ARRAY, // 0x8E
        ARRAY, // 0x8F
        ARRAY, // 0x90
        ARRAY, // 0x91
        ARRAY, // 0x92
        ARRAY, // 0x93
        ARRAY, // 0x94
        ARRAY, // 0x95
        ARRAY, // 0x96
        ARRAY, // 0x97
        // array (one-byte uint8_t fo, and then n data items follow)
        ARRAY_8, // 0x98
        // array (two-byte uint16_t for n, and then n data items follow)
        ARRAY_16, // 0x99
        // array (four-byte uint32_t for n, and then n data items follow)
        ARRAY_32, // 0x9a
        // array (eight-byte uint64_t for n, and then n data items follow)
        ARRAY_64, // 0x9b
        // array, data items follow, terminated by "break"
        ERROR, // 0x9c
        ERROR, // 0x9d
        ERROR, // 0x9e
        ARRAY_BREAK, // 0x9f
        // map (0x00..0x17 pairs of data items follow)
        MAP, // 0xa0
        MAP, // 0xa1
        MAP, // 0xa2
        MAP, // 0xa3
        MAP, // 0xa4
        MAP, // 0xa5
        MAP, // 0xa6
        MAP, // 0xa7
        MAP, // 0xa8
        MAP, // 0xa9
        MAP, // 0xaA
        MAP, // 0xaB
        MAP, // 0xaC
        MAP, // 0xaD
        MAP, // 0xaE
        MAP, // 0xaF
        MAP, // 0xb0
        MAP, // 0xb1
        MAP, // 0xb2
        MAP, // 0xb3
        MAP, // 0xb4
        MAP, // 0xb5
        MAP, // 0xb6
        MAP, // 0xb7
        // map (one-byte uint8_t for n, and then n pairs of data items follow)
        MAP_8, // 0xb8
        // map (two-byte uint16_t for n, and then n pairs of data items follow)
        MAP_16, // 0xb9
        // map (four-byte uint32_t for n, and then n pairs of data items follow)
        MAP_32, // 0xba
        // map (eight-byte uint64_t for n, and then n pairs of data items follow)
        MAP_64, // 0xbb
        ERROR, // 0xbc
        ERROR, // 0xbd
        ERROR, // 0xbe
        // map, pairs of data items follow, terminated by "break"
        MAP_BREAK, // 0xbf
        // Text-based date/time (data item follows; see Section 2.4.1)
        TAG_KNOWN, // 0xc0
        // Epoch-based date/time (data item follows; see Section 2.4.1)
        TAG_KNOWN, // 0xc1
        // Positive bignum (data item "byte string" follows)
        TAG_KNOWN, // 0xc2
        // Negative bignum (data item "byte string" follows)
        TAG_KNOWN, // 0xc3
        // Decimal Fraction (data item "array" follows; see Section 2.4.3)
        TAG_KNOWN, // 0xc4
        // Bigfloat (data item "array" follows; see Section 2.4.3)
        TAG_KNOWN, // 0xc5
        // (tagged item)
        TAG_UNASSIGNED, // 0xc6
        TAG_UNASSIGNED, // 0xc7
        TAG_UNASSIGNED, // 0xc8
        TAG_UNASSIGNED, // 0xc9
        TAG_UNASSIGNED, // 0xca
        TAG_UNASSIGNED, // 0xcb
        TAG_UNASSIGNED, // 0xcc
        TAG_UNASSIGNED, // 0xcd
        TAG_UNASSIGNED, // 0xce
        TAG_UNASSIGNED, // 0xcf
        TAG_UNASSIGNED, // 0xd0
        TAG_UNASSIGNED, // 0xd1
        TAG_UNASSIGNED, // 0xd2
        TAG_UNASSIGNED, // 0xd3
        TAG_UNASSIGNED, // 0xd4
        // Expected Conversion (data item follows; see Section 2.4.4.2)
        TAG_UNASSIGNED, // 0xd5
        TAG_UNASSIGNED, // 0xd6
        TAG_UNASSIGNED, // 0xd7
        // (more tagged items, 1/2/4/8 bytes and then a data item follow)
        TAG_MORE_1, // 0xd8
        TAG_MORE_2, // 0xd9
        TAG_MORE_4, // 0xda
        TAG_MORE_8, // 0xdb
        ERROR, // 0xdc
        ERROR, // 0xdd
        ERROR, // 0xde
        ERROR, // 0xdf
        // (simple value)
        SIMPLE_UNASSIGNED, // 0xe0
        SIMPLE_UNASSIGNED, // 0xe1
        SIMPLE_UNASSIGNED, // 0xe2
        SIMPLE_UNASSIGNED, // 0xe3
        SIMPLE_UNASSIGNED, // 0xe4
        SIMPLE_UNASSIGNED, // 0xe5
        SIMPLE_UNASSIGNED, // 0xe6
        SIMPLE_UNASSIGNED, // 0xe7
        SIMPLE_UNASSIGNED, // 0xe8
        SIMPLE_UNASSIGNED, // 0xe9
        SIMPLE_UNASSIGNED, // 0xea
        SIMPLE_UNASSIGNED, // 0xeb
        SIMPLE_UNASSIGNED, // 0xec
        SIMPLE_UNASSIGNED, // 0xed
        SIMPLE_UNASSIGNED, // 0xee
        SIMPLE_UNASSIGNED, // 0xef
        SIMPLE_UNASSIGNED, // 0xf0
        SIMPLE_UNASSIGNED, // 0xf1
        SIMPLE_UNASSIGNED, // 0xf2
        SIMPLE_UNASSIGNED, // 0xf3
        // False
        SIMPLE_FALSE, // 0xf4
        // True
        SIMPLE_TRUE, // 0xf5
        // Null
        SIMPLE_NULL, // 0xf6
        // Undefined
        SIMPLE_UNDEFINED, // 0xf7
        // (simple value, one byte follows)
        SIMPLE_BYTE, // 0xf8
        // Half-Precision Float (two-byte IEEE 754)
        SIMPLE_FLOAT_HALF, // 0xf9
        // Single-Precision Float (four-byte IEEE 754)
        SIMPLE_FLOAT_SINGLE, // 0xfa
        // Double-Precision Float (eight-byte IEEE 754)
        SIMPLE_FLOAT_DOUBLE, // 0xfb
        ERROR, // 0xfc
        ERROR, // 0xfd
        ERROR, // 0xfe
        // "break" stop code
        BREAK // 0xff
      ];

      // --

      return {
        parse: parse
      }
    };

    var utils$3 = {};

    var constants$2 = {};

    const Bignumber$2 = bignumber.exports.BigNumber;

    constants$2.MT = {
      POS_INT: 0,
      NEG_INT: 1,
      BYTE_STRING: 2,
      UTF8_STRING: 3,
      ARRAY: 4,
      MAP: 5,
      TAG: 6,
      SIMPLE_FLOAT: 7
    };

    constants$2.TAG = {
      DATE_STRING: 0,
      DATE_EPOCH: 1,
      POS_BIGINT: 2,
      NEG_BIGINT: 3,
      DECIMAL_FRAC: 4,
      BIGFLOAT: 5,
      BASE64URL_EXPECTED: 21,
      BASE64_EXPECTED: 22,
      BASE16_EXPECTED: 23,
      CBOR: 24,
      URI: 32,
      BASE64URL: 33,
      BASE64: 34,
      REGEXP: 35,
      MIME: 36
    };

    constants$2.NUMBYTES = {
      ZERO: 0,
      ONE: 24,
      TWO: 25,
      FOUR: 26,
      EIGHT: 27,
      INDEFINITE: 31
    };

    constants$2.SIMPLE = {
      FALSE: 20,
      TRUE: 21,
      NULL: 22,
      UNDEFINED: 23
    };

    constants$2.SYMS = {
      NULL: Symbol('null'),
      UNDEFINED: Symbol('undef'),
      PARENT: Symbol('parent'),
      BREAK: Symbol('break'),
      STREAM: Symbol('stream')
    };

    constants$2.SHIFT32 = Math.pow(2, 32);
    constants$2.SHIFT16 = Math.pow(2, 16);

    constants$2.MAX_SAFE_HIGH = 0x1fffff;
    constants$2.NEG_ONE = new Bignumber$2(-1);
    constants$2.TEN = new Bignumber$2(10);
    constants$2.TWO = new Bignumber$2(2);

    constants$2.PARENT = {
      ARRAY: 0,
      OBJECT: 1,
      MAP: 2,
      TAG: 3,
      BYTE_STRING: 4,
      UTF8_STRING: 5
    };

    (function (exports) {

    const { Buffer } = require$$0;
    const Bignumber = bignumber.exports.BigNumber;

    const constants = constants$2;
    const SHIFT32 = constants.SHIFT32;
    const SHIFT16 = constants.SHIFT16;
    const MAX_SAFE_HIGH = 0x1fffff;

    exports.parseHalf = function parseHalf (buf) {
      var exp, mant, sign;
      sign = buf[0] & 0x80 ? -1 : 1;
      exp = (buf[0] & 0x7C) >> 2;
      mant = ((buf[0] & 0x03) << 8) | buf[1];
      if (!exp) {
        return sign * 5.9604644775390625e-8 * mant
      } else if (exp === 0x1f) {
        return sign * (mant ? 0 / 0 : 2e308)
      } else {
        return sign * Math.pow(2, exp - 25) * (1024 + mant)
      }
    };

    function toHex (n) {
      if (n < 16) {
        return '0' + n.toString(16)
      }

      return n.toString(16)
    }

    exports.arrayBufferToBignumber = function (buf) {
      const len = buf.byteLength;
      let res = '';
      for (let i = 0; i < len; i++) {
        res += toHex(buf[i]);
      }

      return new Bignumber(res, 16)
    };

    // convert an Object into a Map
    exports.buildMap = (obj) => {
      const res = new Map();
      const keys = Object.keys(obj);
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        res.set(keys[i], obj[keys[i]]);
      }
      return res
    };

    exports.buildInt32 = (f, g) => {
      return f * SHIFT16 + g
    };

    exports.buildInt64 = (f1, f2, g1, g2) => {
      const f = exports.buildInt32(f1, f2);
      const g = exports.buildInt32(g1, g2);

      if (f > MAX_SAFE_HIGH) {
        return new Bignumber(f).times(SHIFT32).plus(g)
      } else {
        return (f * SHIFT32) + g
      }
    };

    exports.writeHalf = function writeHalf (buf, half) {
      // assume 0, -0, NaN, Infinity, and -Infinity have already been caught

      // HACK: everyone settle in.  This isn't going to be pretty.
      // Translate cn-cbor's C code (from Carsten Borman):

      // uint32_t be32;
      // uint16_t be16, u16;
      // union {
      //   float f;
      //   uint32_t u;
      // } u32;
      // u32.f = float_val;

      const u32 = Buffer.allocUnsafe(4);
      u32.writeFloatBE(half, 0);
      const u = u32.readUInt32BE(0);

      // if ((u32.u & 0x1FFF) == 0) { /* worth trying half */

      // hildjj: If the lower 13 bits are 0, we won't lose anything in the conversion
      if ((u & 0x1FFF) !== 0) {
        return false
      }

      //   int s16 = (u32.u >> 16) & 0x8000;
      //   int exp = (u32.u >> 23) & 0xff;
      //   int mant = u32.u & 0x7fffff;

      var s16 = (u >> 16) & 0x8000; // top bit is sign
      const exp = (u >> 23) & 0xff; // then 5 bits of exponent
      const mant = u & 0x7fffff;

      //   if (exp == 0 && mant == 0)
      //     ;              /* 0.0, -0.0 */

      // hildjj: zeros already handled.  Assert if you don't believe me.

      //   else if (exp >= 113 && exp <= 142) /* normalized */
      //     s16 += ((exp - 112) << 10) + (mant >> 13);
      if ((exp >= 113) && (exp <= 142)) {
        s16 += ((exp - 112) << 10) + (mant >> 13);

      //   else if (exp >= 103 && exp < 113) { /* denorm, exp16 = 0 */
      //     if (mant & ((1 << (126 - exp)) - 1))
      //       goto float32;         /* loss of precision */
      //     s16 += ((mant + 0x800000) >> (126 - exp));
      } else if ((exp >= 103) && (exp < 113)) {
        if (mant & ((1 << (126 - exp)) - 1)) {
          return false
        }
        s16 += ((mant + 0x800000) >> (126 - exp));

        //   } else if (exp == 255 && mant == 0) { /* Inf */
        //     s16 += 0x7c00;

        // hildjj: Infinity already handled

      //   } else
      //     goto float32;           /* loss of range */
      } else {
        return false
      }

      //   ensure_writable(3);
      //   u16 = s16;
      //   be16 = hton16p((const uint8_t*)&u16);
      buf.writeUInt16BE(s16, 0);
      return true
    };

    exports.keySorter = function (a, b) {
      var lenA = a[0].byteLength;
      var lenB = b[0].byteLength;

      if (lenA > lenB) {
        return 1
      }

      if (lenB > lenA) {
        return -1
      }

      return a[0].compare(b[0])
    };

    // Adapted from http://www.2ality.com/2012/03/signedzero.html
    exports.isNegativeZero = (x) => {
      return x === 0 && (1 / x < 0)
    };

    exports.nextPowerOf2 = (n) => {
      let count = 0;
      // First n in the below condition is for
      // the case where n is 0
      if (n && !(n & (n - 1))) {
        return n
      }

      while (n !== 0) {
        n >>= 1;
        count += 1;
      }

      return 1 << count
    };
    }(utils$3));

    const constants$1 = constants$2;
    const MT$1 = constants$1.MT;
    const SIMPLE = constants$1.SIMPLE;
    const SYMS$1 = constants$1.SYMS;

    /**
     * A CBOR Simple Value that does not map onto a known constant.
     */
    class Simple$1 {
      /**
       * Creates an instance of Simple.
       *
       * @param {integer} value - the simple value's integer value
       */
      constructor (value) {
        if (typeof value !== 'number') {
          throw new Error('Invalid Simple type: ' + (typeof value))
        }
        if ((value < 0) || (value > 255) || ((value | 0) !== value)) {
          throw new Error('value must be a small positive integer: ' + value)
        }
        this.value = value;
      }

      /**
       * Debug string for simple value
       *
       * @returns {string} simple(value)
       */
      toString () {
        return 'simple(' + this.value + ')'
      }

      /**
       * Debug string for simple value
       *
       * @returns {string} simple(value)
       */
      inspect () {
        return 'simple(' + this.value + ')'
      }

      /**
       * Push the simple value onto the CBOR stream
       *
       * @param {cbor.Encoder} gen The generator to push onto
       * @returns {number}
       */
      encodeCBOR (gen) {
        return gen._pushInt(this.value, MT$1.SIMPLE_FLOAT)
      }

      /**
       * Is the given object a Simple?
       *
       * @param {any} obj - object to test
       * @returns {bool} - is it Simple?
       */
      static isSimple (obj) {
        return obj instanceof Simple$1
      }

      /**
       * Decode from the CBOR additional information into a JavaScript value.
       * If the CBOR item has no parent, return a "safe" symbol instead of
       * `null` or `undefined`, so that the value can be passed through a
       * stream in object mode.
       *
       * @param {Number} val - the CBOR additional info to convert
       * @param {bool} hasParent - Does the CBOR item have a parent?
       * @returns {(null|undefined|Boolean|Symbol)} - the decoded value
       */
      static decode (val, hasParent) {
        if (hasParent == null) {
          hasParent = true;
        }
        switch (val) {
          case SIMPLE.FALSE:
            return false
          case SIMPLE.TRUE:
            return true
          case SIMPLE.NULL:
            if (hasParent) {
              return null
            } else {
              return SYMS$1.NULL
            }
          case SIMPLE.UNDEFINED:
            if (hasParent) {
              return undefined
            } else {
              return SYMS$1.UNDEFINED
            }
          case -1:
            if (!hasParent) {
              throw new Error('Invalid BREAK')
            }
            return SYMS$1.BREAK
          default:
            return new Simple$1(val)
        }
      }
    }

    var simple = Simple$1;

    /**
     * A CBOR tagged item, where the tag does not have semantics specified at the
     * moment, or those semantics threw an error during parsing. Typically this will
     * be an extension point you're not yet expecting.
     */
    class Tagged$1 {
      /**
       * Creates an instance of Tagged.
       *
       * @param {Number} tag - the number of the tag
       * @param {any} value - the value inside the tag
       * @param {Error} err - the error that was thrown parsing the tag, or null
       */
      constructor (tag, value, err) {
        this.tag = tag;
        this.value = value;
        this.err = err;
        if (typeof this.tag !== 'number') {
          throw new Error('Invalid tag type (' + (typeof this.tag) + ')')
        }
        if ((this.tag < 0) || ((this.tag | 0) !== this.tag)) {
          throw new Error('Tag must be a positive integer: ' + this.tag)
        }
      }

      /**
       * Convert to a String
       *
       * @returns {String} string of the form '1(2)'
       */
      toString () {
        return `${this.tag}(${JSON.stringify(this.value)})`
      }

      /**
       * Push the simple value onto the CBOR stream
       *
       * @param {cbor.Encoder} gen The generator to push onto
       * @returns {number}
       */
      encodeCBOR (gen) {
        gen._pushTag(this.tag);
        return gen.pushAny(this.value)
      }

      /**
       * If we have a converter for this type, do the conversion.  Some converters
       * are built-in.  Additional ones can be passed in.  If you want to remove
       * a built-in converter, pass a converter in whose value is 'null' instead
       * of a function.
       *
       * @param {Object} converters - keys in the object are a tag number, the value
       *   is a function that takes the decoded CBOR and returns a JavaScript value
       *   of the appropriate type.  Throw an exception in the function on errors.
       * @returns {any} - the converted item
       */
      convert (converters) {
        var er, f;
        f = converters != null ? converters[this.tag] : undefined;
        if (typeof f !== 'function') {
          f = Tagged$1['_tag' + this.tag];
          if (typeof f !== 'function') {
            return this
          }
        }
        try {
          return f.call(Tagged$1, this.value)
        } catch (error) {
          er = error;
          this.err = er;
          return this
        }
      }
    }

    var tagged = Tagged$1;

    const defaultBase$1 = self.location ?
        self.location.protocol + '//' + self.location.host :
        '';
    const URL$2 = self.URL;

    class URLWithLegacySupport$2 {
        constructor(url = '', base = defaultBase$1) {
            this.super = new URL$2(url, base);
            this.path = this.pathname + this.search;
            this.auth =
                this.username && this.password ?
                    this.username + ':' + this.password :
                    null;

            this.query =
                this.search && this.search.startsWith('?') ?
                    this.search.slice(1) :
                    null;
        }

        get hash() {
            return this.super.hash;
        }
        get host() {
            return this.super.host;
        }
        get hostname() {
            return this.super.hostname;
        }
        get href() {
            return this.super.href;
        }
        get origin() {
            return this.super.origin;
        }
        get password() {
            return this.super.password;
        }
        get pathname() {
            return this.super.pathname;
        }
        get port() {
            return this.super.port;
        }
        get protocol() {
            return this.super.protocol;
        }
        get search() {
            return this.super.search;
        }
        get searchParams() {
            return this.super.searchParams;
        }
        get username() {
            return this.super.username;
        }

        set hash(hash) {
            this.super.hash = hash;
        }
        set host(host) {
            this.super.host = host;
        }
        set hostname(hostname) {
            this.super.hostname = hostname;
        }
        set href(href) {
            this.super.href = href;
        }
        set origin(origin) {
            this.super.origin = origin;
        }
        set password(password) {
            this.super.password = password;
        }
        set pathname(pathname) {
            this.super.pathname = pathname;
        }
        set port(port) {
            this.super.port = port;
        }
        set protocol(protocol) {
            this.super.protocol = protocol;
        }
        set search(search) {
            this.super.search = search;
        }
        set searchParams(searchParams) {
            this.super.searchParams = searchParams;
        }
        set username(username) {
            this.super.username = username;
        }

        createObjectURL(o) {
            return this.super.createObjectURL(o);
        }
        revokeObjectURL(o) {
            this.super.revokeObjectURL(o);
        }
        toJSON() {
            return this.super.toJSON();
        }
        toString() {
            return this.super.toString();
        }
        format() {
            return this.toString();
        }
    }

    function format$2(obj) {
        if (typeof obj === 'string') {
            const url = new URL$2(obj);

            return url.toString();
        }

        if (!(obj instanceof URL$2)) {
            const userPass =
                obj.username && obj.password ?
                    `${obj.username}:${obj.password}@` :
                    '';
            const auth = obj.auth ? obj.auth + '@' : '';
            const port = obj.port ? ':' + obj.port : '';
            const protocol = obj.protocol ? obj.protocol + '//' : '';
            const host = obj.host || '';
            const hostname = obj.hostname || '';
            const search = obj.search || (obj.query ? '?' + obj.query : '');
            const hash = obj.hash || '';
            const pathname = obj.pathname || '';
            const path = obj.path || pathname + search;

            return `${protocol}${userPass || auth}${host ||
            hostname + port}${path}${hash}`;
        }
    }

    var urlBrowser = {
        URLWithLegacySupport: URLWithLegacySupport$2,
        URLSearchParams: self.URLSearchParams,
        defaultBase: defaultBase$1,
        format: format$2
    };

    const { URLWithLegacySupport: URLWithLegacySupport$1, format: format$1 } = urlBrowser;

    var relative$1 = (url, location = {}, protocolMap = {}, defaultProtocol) => {
        let protocol = location.protocol ?
            location.protocol.replace(':', '') :
            'http';

        // Check protocol map
        protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ':';
        let urlParsed;

        try {
            urlParsed = new URLWithLegacySupport$1(url);
        } catch (err) {
            urlParsed = {};
        }

        const base = Object.assign({}, location, {
            protocol: protocol || urlParsed.protocol,
            host: location.host || urlParsed.host
        });

        return new URLWithLegacySupport$1(url, format$1(base)).toString();
    };

    const {
        URLWithLegacySupport,
        format,
        URLSearchParams,
        defaultBase
    } = urlBrowser;
    const relative = relative$1;

    var isoUrl = {
        URL: URLWithLegacySupport,
        URLSearchParams,
        format,
        relative,
        defaultBase
    };

    const { Buffer: Buffer$2 } = require$$0;
    const ieee754 = ieee754$1;
    const Bignumber$1 = bignumber.exports.BigNumber;

    const parser = decoder_asm;
    const utils$2 = utils$3;
    const c = constants$2;
    const Simple = simple;
    const Tagged = tagged;
    const { URL: URL$1 } = isoUrl;

    /**
     * Transform binary cbor data into JavaScript objects.
     */
    class Decoder$1 {
      /**
       * @param {Object} [opts={}]
       * @param {number} [opts.size=65536] - Size of the allocated heap.
       */
      constructor (opts) {
        opts = opts || {};

        if (!opts.size || opts.size < 0x10000) {
          opts.size = 0x10000;
        } else {
          // Ensure the size is a power of 2
          opts.size = utils$2.nextPowerOf2(opts.size);
        }

        // Heap use to share the input with the parser
        this._heap = new ArrayBuffer(opts.size);
        this._heap8 = new Uint8Array(this._heap);
        this._buffer = Buffer$2.from(this._heap);

        this._reset();

        // Known tags
        this._knownTags = Object.assign({
          0: (val) => new Date(val),
          1: (val) => new Date(val * 1000),
          2: (val) => utils$2.arrayBufferToBignumber(val),
          3: (val) => c.NEG_ONE.minus(utils$2.arrayBufferToBignumber(val)),
          4: (v) => {
            // const v = new Uint8Array(val)
            return c.TEN.pow(v[0]).times(v[1])
          },
          5: (v) => {
            // const v = new Uint8Array(val)
            return c.TWO.pow(v[0]).times(v[1])
          },
          32: (val) => new URL$1(val),
          35: (val) => new RegExp(val)
        }, opts.tags);

        // Initialize asm based parser
        this.parser = parser(commonjsGlobal, {
          // eslint-disable-next-line no-console
          log: console.log.bind(console),
          pushInt: this.pushInt.bind(this),
          pushInt32: this.pushInt32.bind(this),
          pushInt32Neg: this.pushInt32Neg.bind(this),
          pushInt64: this.pushInt64.bind(this),
          pushInt64Neg: this.pushInt64Neg.bind(this),
          pushFloat: this.pushFloat.bind(this),
          pushFloatSingle: this.pushFloatSingle.bind(this),
          pushFloatDouble: this.pushFloatDouble.bind(this),
          pushTrue: this.pushTrue.bind(this),
          pushFalse: this.pushFalse.bind(this),
          pushUndefined: this.pushUndefined.bind(this),
          pushNull: this.pushNull.bind(this),
          pushInfinity: this.pushInfinity.bind(this),
          pushInfinityNeg: this.pushInfinityNeg.bind(this),
          pushNaN: this.pushNaN.bind(this),
          pushNaNNeg: this.pushNaNNeg.bind(this),
          pushArrayStart: this.pushArrayStart.bind(this),
          pushArrayStartFixed: this.pushArrayStartFixed.bind(this),
          pushArrayStartFixed32: this.pushArrayStartFixed32.bind(this),
          pushArrayStartFixed64: this.pushArrayStartFixed64.bind(this),
          pushObjectStart: this.pushObjectStart.bind(this),
          pushObjectStartFixed: this.pushObjectStartFixed.bind(this),
          pushObjectStartFixed32: this.pushObjectStartFixed32.bind(this),
          pushObjectStartFixed64: this.pushObjectStartFixed64.bind(this),
          pushByteString: this.pushByteString.bind(this),
          pushByteStringStart: this.pushByteStringStart.bind(this),
          pushUtf8String: this.pushUtf8String.bind(this),
          pushUtf8StringStart: this.pushUtf8StringStart.bind(this),
          pushSimpleUnassigned: this.pushSimpleUnassigned.bind(this),
          pushTagUnassigned: this.pushTagUnassigned.bind(this),
          pushTagStart: this.pushTagStart.bind(this),
          pushTagStart4: this.pushTagStart4.bind(this),
          pushTagStart8: this.pushTagStart8.bind(this),
          pushBreak: this.pushBreak.bind(this)
        }, this._heap);
      }

      get _depth () {
        return this._parents.length
      }

      get _currentParent () {
        return this._parents[this._depth - 1]
      }

      get _ref () {
        return this._currentParent.ref
      }

      // Finish the current parent
      _closeParent () {
        var p = this._parents.pop();

        if (p.length > 0) {
          throw new Error(`Missing ${p.length} elements`)
        }

        switch (p.type) {
          case c.PARENT.TAG:
            this._push(
              this.createTag(p.ref[0], p.ref[1])
            );
            break
          case c.PARENT.BYTE_STRING:
            this._push(this.createByteString(p.ref, p.length));
            break
          case c.PARENT.UTF8_STRING:
            this._push(this.createUtf8String(p.ref, p.length));
            break
          case c.PARENT.MAP:
            if (p.values % 2 > 0) {
              throw new Error('Odd number of elements in the map')
            }
            this._push(this.createMap(p.ref, p.length));
            break
          case c.PARENT.OBJECT:
            if (p.values % 2 > 0) {
              throw new Error('Odd number of elements in the map')
            }
            this._push(this.createObject(p.ref, p.length));
            break
          case c.PARENT.ARRAY:
            this._push(this.createArray(p.ref, p.length));
            break
        }

        if (this._currentParent && this._currentParent.type === c.PARENT.TAG) {
          this._dec();
        }
      }

      // Reduce the expected length of the current parent by one
      _dec () {
        const p = this._currentParent;
        // The current parent does not know the epxected child length

        if (p.length < 0) {
          return
        }

        p.length--;

        // All children were seen, we can close the current parent
        if (p.length === 0) {
          this._closeParent();
        }
      }

      // Push any value to the current parent
      _push (val, hasChildren) {
        const p = this._currentParent;
        p.values++;

        switch (p.type) {
          case c.PARENT.ARRAY:
          case c.PARENT.BYTE_STRING:
          case c.PARENT.UTF8_STRING:
            if (p.length > -1) {
              this._ref[this._ref.length - p.length] = val;
            } else {
              this._ref.push(val);
            }
            this._dec();
            break
          case c.PARENT.OBJECT:
            if (p.tmpKey != null) {
              this._ref[p.tmpKey] = val;
              p.tmpKey = null;
              this._dec();
            } else {
              p.tmpKey = val;

              if (typeof p.tmpKey !== 'string') {
                // too bad, convert to a Map
                p.type = c.PARENT.MAP;
                p.ref = utils$2.buildMap(p.ref);
              }
            }
            break
          case c.PARENT.MAP:
            if (p.tmpKey != null) {
              this._ref.set(p.tmpKey, val);
              p.tmpKey = null;
              this._dec();
            } else {
              p.tmpKey = val;
            }
            break
          case c.PARENT.TAG:
            this._ref.push(val);
            if (!hasChildren) {
              this._dec();
            }
            break
          default:
            throw new Error('Unknown parent type')
        }
      }

      // Create a new parent in the parents list
      _createParent (obj, type, len) {
        this._parents[this._depth] = {
          type: type,
          length: len,
          ref: obj,
          values: 0,
          tmpKey: null
        };
      }

      // Reset all state back to the beginning, also used for initiatlization
      _reset () {
        this._res = [];
        this._parents = [{
          type: c.PARENT.ARRAY,
          length: -1,
          ref: this._res,
          values: 0,
          tmpKey: null
        }];
      }

      // -- Interface to customize deoding behaviour
      createTag (tagNumber, value) {
        const typ = this._knownTags[tagNumber];

        if (!typ) {
          return new Tagged(tagNumber, value)
        }

        return typ(value)
      }

      createMap (obj, len) {
        return obj
      }

      createObject (obj, len) {
        return obj
      }

      createArray (arr, len) {
        return arr
      }

      createByteString (raw, len) {
        return Buffer$2.concat(raw)
      }

      createByteStringFromHeap (start, end) {
        if (start === end) {
          return Buffer$2.alloc(0)
        }

        return Buffer$2.from(this._heap.slice(start, end))
      }

      createInt (val) {
        return val
      }

      createInt32 (f, g) {
        return utils$2.buildInt32(f, g)
      }

      createInt64 (f1, f2, g1, g2) {
        return utils$2.buildInt64(f1, f2, g1, g2)
      }

      createFloat (val) {
        return val
      }

      createFloatSingle (a, b, c, d) {
        return ieee754.read([a, b, c, d], 0, false, 23, 4)
      }

      createFloatDouble (a, b, c, d, e, f, g, h) {
        return ieee754.read([a, b, c, d, e, f, g, h], 0, false, 52, 8)
      }

      createInt32Neg (f, g) {
        return -1 - utils$2.buildInt32(f, g)
      }

      createInt64Neg (f1, f2, g1, g2) {
        const f = utils$2.buildInt32(f1, f2);
        const g = utils$2.buildInt32(g1, g2);

        if (f > c.MAX_SAFE_HIGH) {
          return c.NEG_ONE.minus(new Bignumber$1(f).times(c.SHIFT32).plus(g))
        }

        return -1 - ((f * c.SHIFT32) + g)
      }

      createTrue () {
        return true
      }

      createFalse () {
        return false
      }

      createNull () {
        return null
      }

      createUndefined () {
        return undefined
      }

      createInfinity () {
        return Infinity
      }

      createInfinityNeg () {
        return -Infinity
      }

      createNaN () {
        return NaN
      }

      createNaNNeg () {
        return -NaN
      }

      createUtf8String (raw, len) {
        return raw.join('')
      }

      createUtf8StringFromHeap (start, end) {
        if (start === end) {
          return ''
        }

        return this._buffer.toString('utf8', start, end)
      }

      createSimpleUnassigned (val) {
        return new Simple(val)
      }

      // -- Interface for decoder.asm.js

      pushInt (val) {
        this._push(this.createInt(val));
      }

      pushInt32 (f, g) {
        this._push(this.createInt32(f, g));
      }

      pushInt64 (f1, f2, g1, g2) {
        this._push(this.createInt64(f1, f2, g1, g2));
      }

      pushFloat (val) {
        this._push(this.createFloat(val));
      }

      pushFloatSingle (a, b, c, d) {
        this._push(this.createFloatSingle(a, b, c, d));
      }

      pushFloatDouble (a, b, c, d, e, f, g, h) {
        this._push(this.createFloatDouble(a, b, c, d, e, f, g, h));
      }

      pushInt32Neg (f, g) {
        this._push(this.createInt32Neg(f, g));
      }

      pushInt64Neg (f1, f2, g1, g2) {
        this._push(this.createInt64Neg(f1, f2, g1, g2));
      }

      pushTrue () {
        this._push(this.createTrue());
      }

      pushFalse () {
        this._push(this.createFalse());
      }

      pushNull () {
        this._push(this.createNull());
      }

      pushUndefined () {
        this._push(this.createUndefined());
      }

      pushInfinity () {
        this._push(this.createInfinity());
      }

      pushInfinityNeg () {
        this._push(this.createInfinityNeg());
      }

      pushNaN () {
        this._push(this.createNaN());
      }

      pushNaNNeg () {
        this._push(this.createNaNNeg());
      }

      pushArrayStart () {
        this._createParent([], c.PARENT.ARRAY, -1);
      }

      pushArrayStartFixed (len) {
        this._createArrayStartFixed(len);
      }

      pushArrayStartFixed32 (len1, len2) {
        const len = utils$2.buildInt32(len1, len2);
        this._createArrayStartFixed(len);
      }

      pushArrayStartFixed64 (len1, len2, len3, len4) {
        const len = utils$2.buildInt64(len1, len2, len3, len4);
        this._createArrayStartFixed(len);
      }

      pushObjectStart () {
        this._createObjectStartFixed(-1);
      }

      pushObjectStartFixed (len) {
        this._createObjectStartFixed(len);
      }

      pushObjectStartFixed32 (len1, len2) {
        const len = utils$2.buildInt32(len1, len2);
        this._createObjectStartFixed(len);
      }

      pushObjectStartFixed64 (len1, len2, len3, len4) {
        const len = utils$2.buildInt64(len1, len2, len3, len4);
        this._createObjectStartFixed(len);
      }

      pushByteStringStart () {
        this._parents[this._depth] = {
          type: c.PARENT.BYTE_STRING,
          length: -1,
          ref: [],
          values: 0,
          tmpKey: null
        };
      }

      pushByteString (start, end) {
        this._push(this.createByteStringFromHeap(start, end));
      }

      pushUtf8StringStart () {
        this._parents[this._depth] = {
          type: c.PARENT.UTF8_STRING,
          length: -1,
          ref: [],
          values: 0,
          tmpKey: null
        };
      }

      pushUtf8String (start, end) {
        this._push(this.createUtf8StringFromHeap(start, end));
      }

      pushSimpleUnassigned (val) {
        this._push(this.createSimpleUnassigned(val));
      }

      pushTagStart (tag) {
        this._parents[this._depth] = {
          type: c.PARENT.TAG,
          length: 1,
          ref: [tag]
        };
      }

      pushTagStart4 (f, g) {
        this.pushTagStart(utils$2.buildInt32(f, g));
      }

      pushTagStart8 (f1, f2, g1, g2) {
        this.pushTagStart(utils$2.buildInt64(f1, f2, g1, g2));
      }

      pushTagUnassigned (tagNumber) {
        this._push(this.createTag(tagNumber));
      }

      pushBreak () {
        if (this._currentParent.length > -1) {
          throw new Error('Unexpected break')
        }

        this._closeParent();
      }

      _createObjectStartFixed (len) {
        if (len === 0) {
          this._push(this.createObject({}));
          return
        }

        this._createParent({}, c.PARENT.OBJECT, len);
      }

      _createArrayStartFixed (len) {
        if (len === 0) {
          this._push(this.createArray([]));
          return
        }

        this._createParent(new Array(len), c.PARENT.ARRAY, len);
      }

      _decode (input) {
        if (input.byteLength === 0) {
          throw new Error('Input too short')
        }

        this._reset();
        this._heap8.set(input);
        const code = this.parser.parse(input.byteLength);

        if (this._depth > 1) {
          while (this._currentParent.length === 0) {
            this._closeParent();
          }
          if (this._depth > 1) {
            throw new Error('Undeterminated nesting')
          }
        }

        if (code > 0) {
          throw new Error('Failed to parse')
        }

        if (this._res.length === 0) {
          throw new Error('No valid result')
        }
      }

      // -- Public Interface

      decodeFirst (input) {
        this._decode(input);

        return this._res[0]
      }

      decodeAll (input) {
        this._decode(input);

        return this._res
      }

      /**
       * Decode the first cbor object.
       *
       * @param {Buffer|string} input
       * @param {string} [enc='hex'] - Encoding used if a string is passed.
       * @returns {*}
       */
      static decode (input, enc) {
        if (typeof input === 'string') {
          input = Buffer$2.from(input, enc || 'hex');
        }

        const dec = new Decoder$1({ size: input.length });
        return dec.decodeFirst(input)
      }

      /**
       * Decode all cbor objects.
       *
       * @param {Buffer|string} input
       * @param {string} [enc='hex'] - Encoding used if a string is passed.
       * @returns {Array<*>}
       */
      static decodeAll (input, enc) {
        if (typeof input === 'string') {
          input = Buffer$2.from(input, enc || 'hex');
        }

        const dec = new Decoder$1({ size: input.length });
        return dec.decodeAll(input)
      }
    }

    Decoder$1.decodeFirst = Decoder$1.decode;

    var decoder = Decoder$1;

    const { Buffer: Buffer$1 } = require$$0;
    const Decoder = decoder;
    const utils$1 = utils$3;

    /**
     * Output the diagnostic format from a stream of CBOR bytes.
     *
     */
    class Diagnose extends Decoder {
      createTag (tagNumber, value) {
        return `${tagNumber}(${value})`
      }

      createInt (val) {
        return super.createInt(val).toString()
      }

      createInt32 (f, g) {
        return super.createInt32(f, g).toString()
      }

      createInt64 (f1, f2, g1, g2) {
        return super.createInt64(f1, f2, g1, g2).toString()
      }

      createInt32Neg (f, g) {
        return super.createInt32Neg(f, g).toString()
      }

      createInt64Neg (f1, f2, g1, g2) {
        return super.createInt64Neg(f1, f2, g1, g2).toString()
      }

      createTrue () {
        return 'true'
      }

      createFalse () {
        return 'false'
      }

      createFloat (val) {
        const fl = super.createFloat(val);
        if (utils$1.isNegativeZero(val)) {
          return '-0_1'
        }

        return `${fl}_1`
      }

      createFloatSingle (a, b, c, d) {
        const fl = super.createFloatSingle(a, b, c, d);
        return `${fl}_2`
      }

      createFloatDouble (a, b, c, d, e, f, g, h) {
        const fl = super.createFloatDouble(a, b, c, d, e, f, g, h);
        return `${fl}_3`
      }

      createByteString (raw, len) {
        const val = raw.join(', ');

        if (len === -1) {
          return `(_ ${val})`
        }
        return `h'${val}`
      }

      createByteStringFromHeap (start, end) {
        const val = (Buffer$1.from(
          super.createByteStringFromHeap(start, end)
        )).toString('hex');

        return `h'${val}'`
      }

      createInfinity () {
        return 'Infinity_1'
      }

      createInfinityNeg () {
        return '-Infinity_1'
      }

      createNaN () {
        return 'NaN_1'
      }

      createNaNNeg () {
        return '-NaN_1'
      }

      createNull () {
        return 'null'
      }

      createUndefined () {
        return 'undefined'
      }

      createSimpleUnassigned (val) {
        return `simple(${val})`
      }

      createArray (arr, len) {
        const val = super.createArray(arr, len);

        if (len === -1) {
          // indefinite
          return `[_ ${val.join(', ')}]`
        }

        return `[${val.join(', ')}]`
      }

      createMap (map, len) {
        const val = super.createMap(map);
        const list = Array.from(val.keys())
          .reduce(collectObject(val), '');

        if (len === -1) {
          return `{_ ${list}}`
        }

        return `{${list}}`
      }

      createObject (obj, len) {
        const val = super.createObject(obj);
        const map = Object.keys(val)
          .reduce(collectObject(val), '');

        if (len === -1) {
          return `{_ ${map}}`
        }

        return `{${map}}`
      }

      createUtf8String (raw, len) {
        const val = raw.join(', ');

        if (len === -1) {
          return `(_ ${val})`
        }

        return `"${val}"`
      }

      createUtf8StringFromHeap (start, end) {
        const val = (Buffer$1.from(
          super.createUtf8StringFromHeap(start, end)
        )).toString('utf8');

        return `"${val}"`
      }

      static diagnose (input, enc) {
        if (typeof input === 'string') {
          input = Buffer$1.from(input, enc || 'hex');
        }

        const dec = new Diagnose();
        return dec.decodeFirst(input)
      }
    }

    var diagnose = Diagnose;

    function collectObject (val) {
      return (acc, key) => {
        if (acc) {
          return `${acc}, ${key}: ${val[key]}`
        }
        return `${key}: ${val[key]}`
      }
    }

    const { Buffer } = require$$0;
    const { URL } = isoUrl;
    const Bignumber = bignumber.exports.BigNumber;

    const utils = utils$3;
    const constants = constants$2;
    const MT = constants.MT;
    const NUMBYTES = constants.NUMBYTES;
    const SHIFT32 = constants.SHIFT32;
    const SYMS = constants.SYMS;
    const TAG = constants.TAG;
    const HALF = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.TWO;
    const FLOAT = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.FOUR;
    const DOUBLE = (constants.MT.SIMPLE_FLOAT << 5) | constants.NUMBYTES.EIGHT;
    const TRUE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.TRUE;
    const FALSE = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.FALSE;
    const UNDEFINED = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.UNDEFINED;
    const NULL = (constants.MT.SIMPLE_FLOAT << 5) | constants.SIMPLE.NULL;

    const MAXINT_BN = new Bignumber('0x20000000000000');
    const BUF_NAN = Buffer.from('f97e00', 'hex');
    const BUF_INF_NEG = Buffer.from('f9fc00', 'hex');
    const BUF_INF_POS = Buffer.from('f97c00', 'hex');

    function toType (obj) {
      // [object Type]
      // --------8---1
      return ({}).toString.call(obj).slice(8, -1)
    }

    /**
     * Transform JavaScript values into CBOR bytes
     *
     */
    class Encoder {
      /**
       * @param {Object} [options={}]
       * @param {function(Buffer)} options.stream
       */
      constructor (options) {
        options = options || {};

        this.streaming = typeof options.stream === 'function';
        this.onData = options.stream;

        this.semanticTypes = [
          [URL, this._pushUrl],
          [Bignumber, this._pushBigNumber]
        ];

        const addTypes = options.genTypes || [];
        const len = addTypes.length;
        for (let i = 0; i < len; i++) {
          this.addSemanticType(
            addTypes[i][0],
            addTypes[i][1]
          );
        }

        this._reset();
      }

      addSemanticType (type, fun) {
        const len = this.semanticTypes.length;
        for (let i = 0; i < len; i++) {
          const typ = this.semanticTypes[i][0];
          if (typ === type) {
            const old = this.semanticTypes[i][1];
            this.semanticTypes[i][1] = fun;
            return old
          }
        }
        this.semanticTypes.push([type, fun]);
        return null
      }

      push (val) {
        if (!val) {
          return true
        }

        this.result[this.offset] = val;
        this.resultMethod[this.offset] = 0;
        this.resultLength[this.offset] = val.length;
        this.offset++;

        if (this.streaming) {
          this.onData(this.finalize());
        }

        return true
      }

      pushWrite (val, method, len) {
        this.result[this.offset] = val;
        this.resultMethod[this.offset] = method;
        this.resultLength[this.offset] = len;
        this.offset++;

        if (this.streaming) {
          this.onData(this.finalize());
        }

        return true
      }

      _pushUInt8 (val) {
        return this.pushWrite(val, 1, 1)
      }

      _pushUInt16BE (val) {
        return this.pushWrite(val, 2, 2)
      }

      _pushUInt32BE (val) {
        return this.pushWrite(val, 3, 4)
      }

      _pushDoubleBE (val) {
        return this.pushWrite(val, 4, 8)
      }

      _pushNaN () {
        return this.push(BUF_NAN)
      }

      _pushInfinity (obj) {
        const half = (obj < 0) ? BUF_INF_NEG : BUF_INF_POS;
        return this.push(half)
      }

      _pushFloat (obj) {
        const b2 = Buffer.allocUnsafe(2);

        if (utils.writeHalf(b2, obj)) {
          if (utils.parseHalf(b2) === obj) {
            return this._pushUInt8(HALF) && this.push(b2)
          }
        }

        const b4 = Buffer.allocUnsafe(4);
        b4.writeFloatBE(obj, 0);
        if (b4.readFloatBE(0) === obj) {
          return this._pushUInt8(FLOAT) && this.push(b4)
        }

        return this._pushUInt8(DOUBLE) && this._pushDoubleBE(obj)
      }

      _pushInt (obj, mt, orig) {
        const m = mt << 5;
        if (obj < 24) {
          return this._pushUInt8(m | obj)
        }

        if (obj <= 0xff) {
          return this._pushUInt8(m | NUMBYTES.ONE) && this._pushUInt8(obj)
        }

        if (obj <= 0xffff) {
          return this._pushUInt8(m | NUMBYTES.TWO) && this._pushUInt16BE(obj)
        }

        if (obj <= 0xffffffff) {
          return this._pushUInt8(m | NUMBYTES.FOUR) && this._pushUInt32BE(obj)
        }

        if (obj <= Number.MAX_SAFE_INTEGER) {
          return this._pushUInt8(m | NUMBYTES.EIGHT) &&
            this._pushUInt32BE(Math.floor(obj / SHIFT32)) &&
            this._pushUInt32BE(obj % SHIFT32)
        }

        if (mt === MT.NEG_INT) {
          return this._pushFloat(orig)
        }

        return this._pushFloat(obj)
      }

      _pushIntNum (obj) {
        if (obj < 0) {
          return this._pushInt(-obj - 1, MT.NEG_INT, obj)
        } else {
          return this._pushInt(obj, MT.POS_INT)
        }
      }

      _pushNumber (obj) {
        switch (false) {
          case (obj === obj): // eslint-disable-line
            return this._pushNaN(obj)
          case isFinite(obj):
            return this._pushInfinity(obj)
          case ((obj % 1) !== 0):
            return this._pushIntNum(obj)
          default:
            return this._pushFloat(obj)
        }
      }

      _pushString (obj) {
        const len = Buffer.byteLength(obj, 'utf8');
        return this._pushInt(len, MT.UTF8_STRING) && this.pushWrite(obj, 5, len)
      }

      _pushBoolean (obj) {
        return this._pushUInt8(obj ? TRUE : FALSE)
      }

      _pushUndefined (obj) {
        return this._pushUInt8(UNDEFINED)
      }

      _pushArray (gen, obj) {
        const len = obj.length;
        if (!gen._pushInt(len, MT.ARRAY)) {
          return false
        }
        for (let j = 0; j < len; j++) {
          if (!gen.pushAny(obj[j])) {
            return false
          }
        }
        return true
      }

      _pushTag (tag) {
        return this._pushInt(tag, MT.TAG)
      }

      _pushDate (gen, obj) {
        // Round date, to get seconds since 1970-01-01 00:00:00 as defined in
        // Sec. 2.4.1 and get a possibly more compact encoding. Note that it is
        // still allowed to encode fractions of seconds which can be achieved by
        // changing overwriting the encode function for Date objects.
        return gen._pushTag(TAG.DATE_EPOCH) && gen.pushAny(Math.round(obj / 1000))
      }

      _pushBuffer (gen, obj) {
        return gen._pushInt(obj.length, MT.BYTE_STRING) && gen.push(obj)
      }

      _pushNoFilter (gen, obj) {
        return gen._pushBuffer(gen, obj.slice())
      }

      _pushRegexp (gen, obj) {
        return gen._pushTag(TAG.REGEXP) && gen.pushAny(obj.source)
      }

      _pushSet (gen, obj) {
        if (!gen._pushInt(obj.size, MT.ARRAY)) {
          return false
        }
        for (const x of obj) {
          if (!gen.pushAny(x)) {
            return false
          }
        }
        return true
      }

      _pushUrl (gen, obj) {
        return gen._pushTag(TAG.URI) && gen.pushAny(obj.format())
      }

      _pushBigint (obj) {
        let tag = TAG.POS_BIGINT;
        if (obj.isNegative()) {
          obj = obj.negated().minus(1);
          tag = TAG.NEG_BIGINT;
        }
        let str = obj.toString(16);
        if (str.length % 2) {
          str = '0' + str;
        }
        const buf = Buffer.from(str, 'hex');
        return this._pushTag(tag) && this._pushBuffer(this, buf)
      }

      _pushBigNumber (gen, obj) {
        if (obj.isNaN()) {
          return gen._pushNaN()
        }
        if (!obj.isFinite()) {
          return gen._pushInfinity(obj.isNegative() ? -Infinity : Infinity)
        }
        if (obj.isInteger()) {
          return gen._pushBigint(obj)
        }
        if (!(gen._pushTag(TAG.DECIMAL_FRAC) &&
          gen._pushInt(2, MT.ARRAY))) {
          return false
        }

        const dec = obj.decimalPlaces();
        const slide = obj.multipliedBy(new Bignumber(10).pow(dec));
        if (!gen._pushIntNum(-dec)) {
          return false
        }
        if (slide.abs().isLessThan(MAXINT_BN)) {
          return gen._pushIntNum(slide.toNumber())
        } else {
          return gen._pushBigint(slide)
        }
      }

      _pushMap (gen, obj) {
        if (!gen._pushInt(obj.size, MT.MAP)) {
          return false
        }

        return this._pushRawMap(
          obj.size,
          Array.from(obj)
        )
      }

      _pushObject (obj) {
        if (!obj) {
          return this._pushUInt8(NULL)
        }

        var len = this.semanticTypes.length;
        for (var i = 0; i < len; i++) {
          if (obj instanceof this.semanticTypes[i][0]) {
            return this.semanticTypes[i][1].call(obj, this, obj)
          }
        }

        var f = obj.encodeCBOR;
        if (typeof f === 'function') {
          return f.call(obj, this)
        }

        var keys = Object.keys(obj);
        var keyLength = keys.length;
        if (!this._pushInt(keyLength, MT.MAP)) {
          return false
        }

        return this._pushRawMap(
          keyLength,
          keys.map((k) => [k, obj[k]])
        )
      }

      _pushRawMap (len, map) {
        // Sort keys for canoncialization
        // 1. encode key
        // 2. shorter key comes before longer key
        // 3. same length keys are sorted with lower
        //    byte value before higher

        map = map.map(function (a) {
          a[0] = Encoder.encode(a[0]);
          return a
        }).sort(utils.keySorter);

        for (var j = 0; j < len; j++) {
          if (!this.push(map[j][0])) {
            return false
          }

          if (!this.pushAny(map[j][1])) {
            return false
          }
        }

        return true
      }

      /**
       * Alias for `.pushAny`
       *
       * @param {*} obj
       * @returns {boolean} true on success
       */
      write (obj) {
        return this.pushAny(obj)
      }

      /**
       * Push any supported type onto the encoded stream
       *
       * @param {any} obj
       * @returns {boolean} true on success
       */
      pushAny (obj) {
        var typ = toType(obj);

        switch (typ) {
          case 'Number':
            return this._pushNumber(obj)
          case 'String':
            return this._pushString(obj)
          case 'Boolean':
            return this._pushBoolean(obj)
          case 'Object':
            return this._pushObject(obj)
          case 'Array':
            return this._pushArray(this, obj)
          case 'Uint8Array':
            return this._pushBuffer(this, Buffer.isBuffer(obj) ? obj : Buffer.from(obj))
          case 'Null':
            return this._pushUInt8(NULL)
          case 'Undefined':
            return this._pushUndefined(obj)
          case 'Map':
            return this._pushMap(this, obj)
          case 'Set':
            return this._pushSet(this, obj)
          case 'URL':
            return this._pushUrl(this, obj)
          case 'BigNumber':
            return this._pushBigNumber(this, obj)
          case 'Date':
            return this._pushDate(this, obj)
          case 'RegExp':
            return this._pushRegexp(this, obj)
          case 'Symbol':
            switch (obj) {
              case SYMS.NULL:
                return this._pushObject(null)
              case SYMS.UNDEFINED:
                return this._pushUndefined(undefined)
              // TODO: Add pluggable support for other symbols
              default:
                throw new Error('Unknown symbol: ' + obj.toString())
            }
          default:
            throw new Error('Unknown type: ' + typeof obj + ', ' + (obj ? obj.toString() : ''))
        }
      }

      finalize () {
        if (this.offset === 0) {
          return null
        }

        var result = this.result;
        var resultLength = this.resultLength;
        var resultMethod = this.resultMethod;
        var offset = this.offset;

        // Determine the size of the buffer
        var size = 0;
        var i = 0;

        for (; i < offset; i++) {
          size += resultLength[i];
        }

        var res = Buffer.allocUnsafe(size);
        var index = 0;
        var length = 0;

        // Write the content into the result buffer
        for (i = 0; i < offset; i++) {
          length = resultLength[i];

          switch (resultMethod[i]) {
            case 0:
              result[i].copy(res, index);
              break
            case 1:
              res.writeUInt8(result[i], index, true);
              break
            case 2:
              res.writeUInt16BE(result[i], index, true);
              break
            case 3:
              res.writeUInt32BE(result[i], index, true);
              break
            case 4:
              res.writeDoubleBE(result[i], index, true);
              break
            case 5:
              res.write(result[i], index, length, 'utf8');
              break
            default:
              throw new Error('unkown method')
          }

          index += length;
        }

        var tmp = res;

        this._reset();

        return tmp
      }

      _reset () {
        this.result = [];
        this.resultMethod = [];
        this.resultLength = [];
        this.offset = 0;
      }

      /**
       * Encode the given value
       * @param {*} o
       * @returns {Buffer}
       */
      static encode (o) {
        const enc = new Encoder();
        const ret = enc.pushAny(o);
        if (!ret) {
          throw new Error('Failed to encode input')
        }

        return enc.finalize()
      }
    }

    var encoder = Encoder;

    (function (exports) {

    // exports.Commented = require('./commented')
    exports.Diagnose = diagnose;
    exports.Decoder = decoder;
    exports.Encoder = encoder;
    exports.Simple = simple;
    exports.Tagged = tagged;

    // exports.comment = exports.Commented.comment
    exports.decodeAll = exports.Decoder.decodeAll;
    exports.decodeFirst = exports.Decoder.decodeFirst;
    exports.diagnose = exports.Diagnose.diagnose;
    exports.encode = exports.Encoder.encode;
    exports.decode = exports.Decoder.decode;

    exports.leveldb = {
      decode: exports.Decoder.decodeAll,
      encode: exports.Encoder.encode,
      buffer: true,
      name: 'cbor'
    };
    }(src));

    /*!
     * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
     */

    class Hashlink {
      /**
       * Encodes a new Hashlink instance that can be used to encode or decode
       * data at URLs.
       *
       * @returns {Hashlink} A Hashlink used to encode and decode cryptographic
       *   hyperlinks.
       */
      constructor() {
        this.registeredCodecs = {};
      }

      /**
       * Encodes a hashlink. If only a `url` parameter is provided, the URL is
       * fetched, transformed, and encoded into a hashlink. If a data parameter
       * is provided, the hashlink is encoded from the data.
       *
       * @param {Object} options - The options for the encode operation.
       * @param {Uint8Array} [options.data] - The data associated with the given
       *   URL. If provided, this data is used to encode the cryptographic hash.
       * @param {Array} options.codecs - One or more codecs that should be used
       *   to encode the data.
       * @param {Array} [options.urls] - One or more URLs that contain the data
       *   referred to by the hashlink.
       * @param {Object} [options.meta] - A set of key-value metadata that will be
       *   encoded into the hashlink.
       *
       * @returns {Promise<string>} Resolves to a string that is a hashlink.
       */
      async encode({data, urls, codecs= ['mh-sha2-256', 'mb-base58-btc'], meta = {}}) {
        // ensure data or urls are provided
        if(data === undefined && urls === undefined) {
          throw new Error('Either `data` or `urls` must be provided.');
        }

        // ensure codecs are provided
        if(codecs === undefined) {
          throw new Error('The hashlink creation `codecs` must be provided.');
        }

        if(urls !== undefined) {
          // ensure urls are an array
          if(!Array.isArray(urls)) {
            urls = [urls];
          }

          // ensure all URLs are strings
          urls.forEach(url => {
            if(typeof url !== 'string') {
              throw new Error(`URL "${url}" must be a string.`);
            }
          });

          // merge meta options with urls
          meta = {...meta, url: urls};
        }

        // generate the encoded cryptographic hash
        const outputData = await codecs.reduce(async (output, codec) => {
          const encoder = this.registeredCodecs[codec];
          if(encoder === undefined) {
            throw new Error(`Unknown cryptographic hash encoder "${encoder}".`);
          }

          return encoder.encode(await output);
        }, data);

        // generate the encoded metadata
        const metadata = new Map();
        if(meta.url) {
          metadata.set(0x0f, meta.url);
        }
        if(meta['content-type']) {
          metadata.set(0x0e, meta['content-type']);
        }
        if(meta.experimental) {
          metadata.set(0x0d, meta.experimental);
        }
        if(meta.transform) {
          metadata.set(0x0c, meta.transform);
        }

        // build the hashlink
        const textDecoder = new TextDecoder();
        let hashlink = 'hl:' + textDecoder.decode(outputData);

        // append meta data if present
        if(metadata.size > 0) {
          const baseEncodingCodec = codecs[codecs.length - 1];
          const cborData = new Uint8Array(src.encode(metadata));
          const mbCborData = textDecoder.decode(
            this.registeredCodecs[baseEncodingCodec].encode(cborData));
          hashlink += ':' + mbCborData;
        }

        return hashlink;
      }

      /**
       * Decodes a hashlink resulting in an object with key-value pairs
       * representing the values encoded in the hashlink.
       *
       * @param {Object} options - The options for the encode operation.
       * @param {string} options.hashlink - The encoded hashlink value to decode.
       *
       * @returns {Object} Returns an object with the decoded hashlink values.
       */
      async decode({hashlink}) {
        const components = hashlink.split(':');
        const decodedValue = {
          hashName: 'unknown',
          hashValue: 'unknown',
          meta: {}
        };

        if(components.length < 2) {
          throw new Error(`Hashlink "${hashlink}" is invalid; ` +
            'it must contain at least one colon.');
        }

        if(components.length > 3) {
          throw new Error(`Hashlink "${hashlink}" is invalid; ` +
            'it contains more than two colons.');
        }

        // determine the base encoding decoder and decode the multihash value
        const multibaseEncodedMultihash = stringToUint8Array(components[1]);
        const multibaseDecoder = this._findDecoder(multibaseEncodedMultihash);
        const encodedMultihash = multibaseDecoder.decode(multibaseEncodedMultihash);

        // determine the multihash decoder
        this._findDecoder(encodedMultihash);

        // decode the cryptographic hash name and value
        const hashDecoder = this._findDecoder(encodedMultihash);
        decodedValue.hashName = hashDecoder.name;
        decodedValue.hashValue = await hashDecoder.decode(encodedMultihash);
        if(components.length === 3) {
          const encodedMeta = stringToUint8Array(components[2]);
          const cborMeta = multibaseDecoder.decode(encodedMeta);
          const meta = src.decode(cborMeta);

          // extract metadata values
          if(meta.has(0x0f)) {
            decodedValue.meta.url = meta.get(0x0f);
          }
          if(meta.has(0x0e)) {
            decodedValue.meta['content-type'] = meta.get(0x0e);
          }
          if(meta.has(0x0d)) {
            decodedValue.meta.experimental = meta.get(0x0d);
          }
          if(meta.has(0x0c)) {
            decodedValue.meta.transform = meta.get(0x0c);
          }
        }

        return decodedValue;
      }

      /**
       * Verifies a hashlink resulting in a simple true or false value.
       *
       * @param {Object} options - The options for the encode operation.
       * @param {string} options.hashlink - The encoded hashlink value to verify.
       * @param {string} options.data - The data to use for the hashlink.
       * @param {Array} options.resolvers - An array of Objects with key-value
       *   pairs. Each object must contain a `scheme` key associated with a
       *   Function({url, options}) that resolves any URL with the given scheme
       *   and options to data.
       *
       * @returns {Promise<boolean>} true if the hashlink is valid, false otherwise.
       */
      async verify({data, hashlink, resolvers}) {
        const components = hashlink.split(':');

        if(components.length > 3) {
          throw new Error(`Hashlink "${hashlink}" is invalid; ` +
            'it contains more than two colons.');
        }

        // determine the base encoding decoder and decode the multihash value
        const multibaseEncodedMultihash = stringToUint8Array(components[1]);
        const multibaseDecoder = this._findDecoder(multibaseEncodedMultihash);
        const encodedMultihash = multibaseDecoder.decode(multibaseEncodedMultihash);

        // determine the multihash decoder
        const multihashDecoder = this._findDecoder(encodedMultihash);

        // extract the metadata to discover extra codecs
        const codecs = [];
        if(components.length === 3) {
          const encodedMeta = stringToUint8Array(components[2]);
          const cborMeta = multibaseDecoder.decode(encodedMeta);
          const meta = src.decode(cborMeta);
          // extract transforms if they exist
          if(meta.has(0x0c)) {
            codecs.push(...meta.get(0x0c));
          }
        }

        // generate the complete list of codecs
        codecs.push(multihashDecoder.algorithm, multibaseDecoder.algorithm);

        // generate the hashlink
        const generatedHashlink = await this.encode({data, codecs});
        const generatedComponents = generatedHashlink.split(':');

        // check to see if the encoded hashes match
        return components[1] === generatedComponents[1];
      }

      /**
       * Extends the Hashlink instance such that it can support new codecs
       * such as new cryptographic hashing, base-encoding, and resolution
       * mechanisms.
       *
       * @param {Codec} codec - A Codec instance that has a .encode()
       *   and a .decode() method. It must also have an `identifier` and
       *   `algorithm` property.
       */
      use(codec) {
        this.registeredCodecs[codec.algorithm] = codec;
      }

      /**
       * Finds a registered decoder for a given set of bytes or throws an Error.
       *
       * @param {Uint8Array} bytes - A stream of bytes to use when matching against
       *   the registered decoders.
       * @returns A registered decoder that can be used to encode/decode the byte
       *   stream.
       */
      _findDecoder(bytes) {
        const decoders = Object.values(this.registeredCodecs);
        const decoder = decoders.find(
          decoder => decoder.identifier.every((id, i) => id === bytes[i]));
        if(!decoder) {
          throw new Error('Could not determine decoder for: ' + bytes);
        }
        return decoder;
      }
    }

    /*!
     * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
     */

    // setup the default encoder/decoder
    const hlDefault = new Hashlink();
    hlDefault.use(new MultihashSha2256());
    hlDefault.use(new MultihashBlake2b64());
    hlDefault.use(new MultibaseBase58btc());

    function configureHashlink() {
        const hl = new Hashlink();
        hl.use(new MultihashSha2256());
        hl.use(new MultihashBlake2b64());
        hl.use(new MultibaseBase58btc());
        return hl;
    }
    const hashlinkElement = document.querySelector('.js-hashlink');
    function init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('init');
            const hl = configureHashlink();
            const hashlink = hashlinkElement.src;
            const decodedHashlink = yield hl.decode({ hashlink });
            if (!decodedHashlink.meta && !((_a = decodedHashlink.meta.url) === null || _a === void 0 ? void 0 : _a.length)) {
                throw new Error('unparseable image, no url provided as meta data');
            }
            const sourceUrl = decodedHashlink.meta.url[0];
            let imageData;
            yield fetch(sourceUrl)
                .then(response => response.text())
                .then(data => imageData = data);
            const textEncoder = new TextEncoder();
            const verified = yield hl.verify({
                data: textEncoder.encode(imageData),
                hashlink
            });
            if (!verified) {
                throw new Error(`Hashlink ${hashlink} does not match data from url ${sourceUrl}`);
            }
            console.log('hashlink was successfully verified');
            if (!decodedHashlink.meta['content-type']) {
                throw new Error('content-type meta property was not specified, unable to rebuild the image');
            }
            const base64Data = btoa(imageData);
            hashlinkElement.src = `data:${decodedHashlink.meta['content-type']};base64,${base64Data}`;
        });
    }
    init();

})();