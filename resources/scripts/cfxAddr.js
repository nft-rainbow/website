(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cfxAddr = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    'use strict'
    
    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray
    
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
    
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }
    
    // Support decoding URL-safe base64 strings, as Node.js does.
    // See: https://en.wikipedia.org/wiki/Base64#URL_applications
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63
    
    function getLens (b64) {
      var len = b64.length
    
      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }
    
      // Trim off extra bytes after placeholder bytes are found
      // See: https://github.com/beatgammit/base64-js/issues/42
      var validLen = b64.indexOf('=')
      if (validLen === -1) validLen = len
    
      var placeHoldersLen = validLen === len
        ? 0
        : 4 - (validLen % 4)
    
      return [validLen, placeHoldersLen]
    }
    
    // base64 is 4/3 + up to two characters of the original data
    function byteLength (b64) {
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }
    
    function _byteLength (b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }
    
    function toByteArray (b64) {
      var tmp
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
    
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
    
      var curByte = 0
    
      // if there are placeholders, only get up to the last complete 4 chars
      var len = placeHoldersLen > 0
        ? validLen - 4
        : validLen
    
      var i
      for (i = 0; i < len; i += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 18) |
          (revLookup[b64.charCodeAt(i + 1)] << 12) |
          (revLookup[b64.charCodeAt(i + 2)] << 6) |
          revLookup[b64.charCodeAt(i + 3)]
        arr[curByte++] = (tmp >> 16) & 0xFF
        arr[curByte++] = (tmp >> 8) & 0xFF
        arr[curByte++] = tmp & 0xFF
      }
    
      if (placeHoldersLen === 2) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 2) |
          (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[curByte++] = tmp & 0xFF
      }
    
      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 10) |
          (revLookup[b64.charCodeAt(i + 1)] << 4) |
          (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[curByte++] = (tmp >> 8) & 0xFF
        arr[curByte++] = tmp & 0xFF
      }
    
      return arr
    }
    
    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] +
        lookup[num >> 12 & 0x3F] +
        lookup[num >> 6 & 0x3F] +
        lookup[num & 0x3F]
    }
    
    function encodeChunk (uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp =
          ((uint8[i] << 16) & 0xFF0000) +
          ((uint8[i + 1] << 8) & 0xFF00) +
          (uint8[i + 2] & 0xFF)
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }
    
    function fromByteArray (uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3
    
      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
      }
    
      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        parts.push(
          lookup[tmp >> 2] +
          lookup[(tmp << 4) & 0x3F] +
          '=='
        )
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1]
        parts.push(
          lookup[tmp >> 10] +
          lookup[(tmp >> 4) & 0x3F] +
          lookup[(tmp << 2) & 0x3F] +
          '='
        )
      }
    
      return parts.join('')
    }
    
    },{}],2:[function(require,module,exports){
    (function (Buffer){(function (){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */
    /* eslint-disable no-proto */
    
    'use strict'
    
    var base64 = require('base64-js')
    var ieee754 = require('ieee754')
    
    exports.Buffer = Buffer
    exports.SlowBuffer = SlowBuffer
    exports.INSPECT_MAX_BYTES = 50
    
    var K_MAX_LENGTH = 0x7fffffff
    exports.kMaxLength = K_MAX_LENGTH
    
    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Print warning and recommend using `buffer` v4.x which has an Object
     *               implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * We report that the browser does not support typed arrays if the are not subclassable
     * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
     * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
     * for __proto__ and has a buggy typed array implementation.
     */
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()
    
    if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
        typeof console.error === 'function') {
      console.error(
        'This browser lacks typed array (Uint8Array) support which is required by ' +
        '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
      )
    }
    
    function typedArraySupport () {
      // Can typed array instances can be augmented?
      try {
        var arr = new Uint8Array(1)
        arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
        return arr.foo() === 42
      } catch (e) {
        return false
      }
    }
    
    Object.defineProperty(Buffer.prototype, 'parent', {
      enumerable: true,
      get: function () {
        if (!Buffer.isBuffer(this)) return undefined
        return this.buffer
      }
    })
    
    Object.defineProperty(Buffer.prototype, 'offset', {
      enumerable: true,
      get: function () {
        if (!Buffer.isBuffer(this)) return undefined
        return this.byteOffset
      }
    })
    
    function createBuffer (length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"')
      }
      // Return an augmented `Uint8Array` instance
      var buf = new Uint8Array(length)
      buf.__proto__ = Buffer.prototype
      return buf
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
    
    function Buffer (arg, encodingOrOffset, length) {
      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          )
        }
        return allocUnsafe(arg)
      }
      return from(arg, encodingOrOffset, length)
    }
    
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    if (typeof Symbol !== 'undefined' && Symbol.species != null &&
        Buffer[Symbol.species] === Buffer) {
      Object.defineProperty(Buffer, Symbol.species, {
        value: null,
        configurable: true,
        enumerable: false,
        writable: false
      })
    }
    
    Buffer.poolSize = 8192 // not used by this implementation
    
    function from (value, encodingOrOffset, length) {
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset)
      }
    
      if (ArrayBuffer.isView(value)) {
        return fromArrayLike(value)
      }
    
      if (value == null) {
        throw TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
          'or Array-like Object. Received type ' + (typeof value)
        )
      }
    
      if (isInstance(value, ArrayBuffer) ||
          (value && isInstance(value.buffer, ArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
    
      if (typeof value === 'number') {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        )
      }
    
      var valueOf = value.valueOf && value.valueOf()
      if (valueOf != null && valueOf !== value) {
        return Buffer.from(valueOf, encodingOrOffset, length)
      }
    
      var b = fromObject(value)
      if (b) return b
    
      if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
          typeof value[Symbol.toPrimitive] === 'function') {
        return Buffer.from(
          value[Symbol.toPrimitive]('string'), encodingOrOffset, length
        )
      }
    
      throw new TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
        'or Array-like Object. Received type ' + (typeof value)
      )
    }
    
    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length)
    }
    
    // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
    // https://github.com/feross/buffer/pull/148
    Buffer.prototype.__proto__ = Uint8Array.prototype
    Buffer.__proto__ = Uint8Array
    
    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be of type number')
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"')
      }
    }
    
    function alloc (size, fill, encoding) {
      assertSize(size)
      if (size <= 0) {
        return createBuffer(size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(size).fill(fill, encoding)
          : createBuffer(size).fill(fill)
      }
      return createBuffer(size)
    }
    
    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding)
    }
    
    function allocUnsafe (size) {
      assertSize(size)
      return createBuffer(size < 0 ? 0 : checked(size) | 0)
    }
    
    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(size)
    }
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(size)
    }
    
    function fromString (string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8'
      }
    
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
    
      var length = byteLength(string, encoding) | 0
      var buf = createBuffer(length)
    
      var actual = buf.write(string, encoding)
    
      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        buf = buf.slice(0, actual)
      }
    
      return buf
    }
    
    function fromArrayLike (array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0
      var buf = createBuffer(length)
      for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255
      }
      return buf
    }
    
    function fromArrayBuffer (array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds')
      }
    
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds')
      }
    
      var buf
      if (byteOffset === undefined && length === undefined) {
        buf = new Uint8Array(array)
      } else if (length === undefined) {
        buf = new Uint8Array(array, byteOffset)
      } else {
        buf = new Uint8Array(array, byteOffset, length)
      }
    
      // Return an augmented `Uint8Array` instance
      buf.__proto__ = Buffer.prototype
      return buf
    }
    
    function fromObject (obj) {
      if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0
        var buf = createBuffer(len)
    
        if (buf.length === 0) {
          return buf
        }
    
        obj.copy(buf, 0, 0, len)
        return buf
      }
    
      if (obj.length !== undefined) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
          return createBuffer(0)
        }
        return fromArrayLike(obj)
      }
    
      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data)
      }
    }
    
    function checked (length) {
      // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= K_MAX_LENGTH) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
      }
      return length | 0
    }
    
    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0
      }
      return Buffer.alloc(+length)
    }
    
    Buffer.isBuffer = function isBuffer (b) {
      return b != null && b._isBuffer === true &&
        b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
    }
    
    Buffer.compare = function compare (a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
      if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        )
      }
    
      if (a === b) return 0
    
      var x = a.length
      var y = b.length
    
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i]
          y = b[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
    Buffer.isEncoding = function isEncoding (encoding) {
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
    }
    
    Buffer.concat = function concat (list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
    
      if (list.length === 0) {
        return Buffer.alloc(0)
      }
    
      var i
      if (length === undefined) {
        length = 0
        for (i = 0; i < list.length; ++i) {
          length += list[i].length
        }
      }
    
      var buffer = Buffer.allocUnsafe(length)
      var pos = 0
      for (i = 0; i < list.length; ++i) {
        var buf = list[i]
        if (isInstance(buf, Uint8Array)) {
          buf = Buffer.from(buf)
        }
        if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos)
        pos += buf.length
      }
      return buffer
    }
    
    function byteLength (string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
          'Received type ' + typeof string
        )
      }
    
      var len = string.length
      var mustMatch = (arguments.length > 2 && arguments[2] === true)
      if (!mustMatch && len === 0) return 0
    
      // Use a for loop to avoid recursion
      var loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
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
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
            }
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer.byteLength = byteLength
    
    function slowToString (encoding, start, end) {
      var loweredCase = false
    
      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.
    
      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }
    
      if (end === undefined || end > this.length) {
        end = this.length
      }
    
      if (end <= 0) {
        return ''
      }
    
      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0
      start >>>= 0
    
      if (end <= start) {
        return ''
      }
    
      if (!encoding) encoding = 'utf8'
    
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
            encoding = (encoding + '').toLowerCase()
            loweredCase = true
        }
      }
    }
    
    // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
    // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
    // reliably in a browserify context because there could be multiple different
    // copies of the 'buffer' package in use. This method works even for Buffer
    // instances that were created from another copy of the `buffer` package.
    // See: https://github.com/feross/buffer/issues/154
    Buffer.prototype._isBuffer = true
    
    function swap (b, n, m) {
      var i = b[n]
      b[n] = b[m]
      b[m] = i
    }
    
    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1)
      }
      return this
    }
    
    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
      return this
    }
    
    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
      return this
    }
    
    Buffer.prototype.toString = function toString () {
      var length = this.length
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    }
    
    Buffer.prototype.toLocaleString = Buffer.prototype.toString
    
    Buffer.prototype.equals = function equals (b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    }
    
    Buffer.prototype.inspect = function inspect () {
      var str = ''
      var max = exports.INSPECT_MAX_BYTES
      str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
      if (this.length > max) str += ' ... '
      return '<Buffer ' + str + '>'
    }
    
    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength)
      }
      if (!Buffer.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. ' +
          'Received type ' + (typeof target)
        )
      }
    
      if (start === undefined) {
        start = 0
      }
      if (end === undefined) {
        end = target ? target.length : 0
      }
      if (thisStart === undefined) {
        thisStart = 0
      }
      if (thisEnd === undefined) {
        thisEnd = this.length
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
    
      start >>>= 0
      end >>>= 0
      thisStart >>>= 0
      thisEnd >>>= 0
    
      if (this === target) return 0
    
      var x = thisEnd - thisStart
      var y = end - start
      var len = Math.min(x, y)
    
      var thisCopy = this.slice(thisStart, thisEnd)
      var targetCopy = target.slice(start, end)
    
      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i]
          y = targetCopy[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
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
        encoding = byteOffset
        byteOffset = 0
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000
      }
      byteOffset = +byteOffset // Coerce to Number.
      if (numberIsNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1)
      }
    
      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0
        else return -1
      }
    
      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding)
      }
    
      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF // Search for a byte value [0-255]
        if (typeof Uint8Array.prototype.indexOf === 'function') {
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
      var indexSize = 1
      var arrLength = arr.length
      var valLength = val.length
    
      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase()
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2
          arrLength /= 2
          valLength /= 2
          byteOffset /= 2
        }
      }
    
      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }
    
      var i
      if (dir) {
        var foundIndex = -1
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex
            foundIndex = -1
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
        for (i = byteOffset; i >= 0; i--) {
          var found = true
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false
              break
            }
          }
          if (found) return i
        }
      }
    
      return -1
    }
    
    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    }
    
    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    }
    
    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    }
    
    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0
      var remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
    
      var strLen = string.length
    
      if (length > strLen / 2) {
        length = strLen / 2
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16)
        if (numberIsNaN(parsed)) return i
        buf[offset + i] = parsed
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
    
    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8'
        length = this.length
        offset = 0
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset
        length = this.length
        offset = 0
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset >>> 0
        if (isFinite(length)) {
          length = length >>> 0
          if (encoding === undefined) encoding = 'utf8'
        } else {
          encoding = length
          length = undefined
        }
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }
    
      var remaining = this.length - offset
      if (length === undefined || length > remaining) length = remaining
    
      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }
    
      if (!encoding) encoding = 'utf8'
    
      var loweredCase = false
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
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    
    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    }
    
    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }
    
    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end)
      var res = []
    
      var i = start
      while (i < end) {
        var firstByte = buf[i]
        var codePoint = null
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
            : (firstByte > 0xBF) ? 2
              : 1
    
        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint
    
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
    
        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD
          bytesPerSequence = 1
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000
          res.push(codePoint >>> 10 & 0x3FF | 0xD800)
          codePoint = 0xDC00 | codePoint & 0x3FF
        }
    
        res.push(codePoint)
        i += bytesPerSequence
      }
    
      return decodeCodePointsArray(res)
    }
    
    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000
    
    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }
    
      // Decode in chunks to avoid "call stack size exceeded".
      var res = ''
      var i = 0
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        )
      }
      return res
    }
    
    function asciiSlice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F)
      }
      return ret
    }
    
    function latin1Slice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }
    
    function hexSlice (buf, start, end) {
      var len = buf.length
    
      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len
    
      var out = ''
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i])
      }
      return out
    }
    
    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end)
      var res = ''
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
      }
      return res
    }
    
    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length
      start = ~~start
      end = end === undefined ? len : ~~end
    
      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }
    
      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }
    
      if (end < start) end = start
    
      var newBuf = this.subarray(start, end)
      // Return an augmented `Uint8Array` instance
      newBuf.__proto__ = Buffer.prototype
      return newBuf
    }
    
    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }
    
    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length)
      }
    
      var val = this[offset + --byteLength]
      var mul = 1
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      return this[offset]
    }
    
    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return this[offset] | (this[offset + 1] << 8)
    }
    
    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return (this[offset] << 8) | this[offset + 1]
    }
    
    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    }
    
    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    }
    
    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var i = byteLength
      var mul = 1
      var val = this[offset + --i]
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    }
    
    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset] | (this[offset + 1] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset + 1] | (this[offset] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    }
    
    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    }
    
    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }
    
    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }
    
    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }
    
    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }
    
    function checkInt (buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }
    
    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var mul = 1
      var i = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      byteLength = byteLength >>> 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var i = byteLength - 1
      var mul = 1
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      return offset + 2
    }
    
    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      this[offset] = (value >>> 8)
      this[offset + 1] = (value & 0xff)
      return offset + 2
    }
    
    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      this[offset + 3] = (value >>> 24)
      this[offset + 2] = (value >>> 16)
      this[offset + 1] = (value >>> 8)
      this[offset] = (value & 0xff)
      return offset + 4
    }
    
    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      this[offset] = (value >>> 24)
      this[offset + 1] = (value >>> 16)
      this[offset + 2] = (value >>> 8)
      this[offset + 3] = (value & 0xff)
      return offset + 4
    }
    
    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = 0
      var mul = 1
      var sub = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = byteLength - 1
      var mul = 1
      var sub = 0
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
      if (value < 0) value = 0xff + value + 1
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      return offset + 2
    }
    
    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      this[offset] = (value >>> 8)
      this[offset + 1] = (value & 0xff)
      return offset + 2
    }
    
    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      this[offset] = (value & 0xff)
      this[offset + 1] = (value >>> 8)
      this[offset + 2] = (value >>> 16)
      this[offset + 3] = (value >>> 24)
      return offset + 4
    }
    
    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (value < 0) value = 0xffffffff + value + 1
      this[offset] = (value >>> 24)
      this[offset + 1] = (value >>> 16)
      this[offset + 2] = (value >>> 8)
      this[offset + 3] = (value & 0xff)
      return offset + 4
    }
    
    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }
    
    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }
    
    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }
    
    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }
    
    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }
    
    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (targetStart >= target.length) targetStart = target.length
      if (!targetStart) targetStart = 0
      if (end > 0 && end < start) end = start
    
      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0
    
      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')
    
      // Are we oob?
      if (end > this.length) end = this.length
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
      }
    
      var len = end - start
    
      if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        // Use built-in when available, missing from IE11
        this.copyWithin(targetStart, start, end)
      } else if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (var i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start]
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        )
      }
    
      return len
    }
    
    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start
          start = 0
          end = this.length
        } else if (typeof end === 'string') {
          encoding = end
          end = this.length
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0)
          if ((encoding === 'utf8' && code < 128) ||
              encoding === 'latin1') {
            // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code
          }
        }
      } else if (typeof val === 'number') {
        val = val & 255
      }
    
      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }
    
      if (end <= start) {
        return this
      }
    
      start = start >>> 0
      end = end === undefined ? this.length : end >>> 0
    
      if (!val) val = 0
    
      var i
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val
        }
      } else {
        var bytes = Buffer.isBuffer(val)
          ? val
          : Buffer.from(val, encoding)
        var len = bytes.length
        if (len === 0) {
          throw new TypeError('The value "' + val +
            '" is invalid for argument "value"')
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len]
        }
      }
    
      return this
    }
    
    // HELPER FUNCTIONS
    // ================
    
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
    
    function base64clean (str) {
      // Node takes equal signs as end of the Base64 encoding
      str = str.split('=')[0]
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = str.trim().replace(INVALID_BASE64_RE, '')
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }
    
    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }
    
    function utf8ToBytes (string, units) {
      units = units || Infinity
      var codePoint
      var length = string.length
      var leadSurrogate = null
      var bytes = []
    
      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i)
    
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            }
    
            // valid lead
            leadSurrogate = codePoint
    
            continue
          }
    
          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            leadSurrogate = codePoint
            continue
          }
    
          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        }
    
        leadSurrogate = null
    
        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else {
          throw new Error('Invalid code point')
        }
      }
    
      return bytes
    }
    
    function asciiToBytes (str) {
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF)
      }
      return byteArray
    }
    
    function utf16leToBytes (str, units) {
      var c, hi, lo
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break
    
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }
    
      return byteArray
    }
    
    function base64ToBytes (str) {
      return base64.toByteArray(base64clean(str))
    }
    
    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i]
      }
      return i
    }
    
    // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
    // the `instanceof` check but they should be treated as of that type.
    // See: https://github.com/feross/buffer/issues/166
    function isInstance (obj, type) {
      return obj instanceof type ||
        (obj != null && obj.constructor != null && obj.constructor.name != null &&
          obj.constructor.name === type.name)
    }
    function numberIsNaN (obj) {
      // For IE11 support
      return obj !== obj // eslint-disable-line no-self-compare
    }
    
    }).call(this)}).call(this,require("buffer").Buffer)
    },{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = (nBytes * 8) - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? (nBytes - 1) : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]
    
      i += d
    
      e = s & ((1 << (-nBits)) - 1)
      s >>= (-nBits)
      nBits += eLen
      for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
    
      m = e & ((1 << (-nBits)) - 1)
      e >>= (-nBits)
      nBits += mLen
      for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
    
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }
    
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = (nBytes * 8) - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
      var i = isLE ? 0 : (nBytes - 1)
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
    
      value = Math.abs(value)
    
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }
    
        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = ((value * c) - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }
    
      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    
      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    
      buffer[offset + i - d] |= s * 128
    }
    
    },{}],4:[function(require,module,exports){
    (function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self,e.JSBI=t())})(this,function(){'use strict';var v=Math.imul,f=Math.clz32;function e(t){"@babel/helpers - typeof";return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){for(var _,n=0;n<t.length;n++)_=t[n],_.enumerable=_.enumerable||!1,_.configurable=!0,"value"in _&&(_.writable=!0),Object.defineProperty(e,_.key,_)}function _(e,t,_){return t&&i(e.prototype,t),_&&i(e,_),e}function n(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&g(e,t)}function l(e){return l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},l(e)}function g(e,t){return g=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},g(e,t)}function o(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}function a(){return a=o()?Reflect.construct:function(e,t,i){var _=[null];_.push.apply(_,t);var n=Function.bind.apply(e,_),l=new n;return i&&g(l,i.prototype),l},a.apply(null,arguments)}function s(e){return-1!==Function.toString.call(e).indexOf("[native code]")}function u(e){var t="function"==typeof Map?new Map:void 0;return u=function(e){function i(){return a(e,arguments,l(this).constructor)}if(null===e||!s(e))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if("undefined"!=typeof t){if(t.has(e))return t.get(e);t.set(e,i)}return i.prototype=Object.create(e.prototype,{constructor:{value:i,enumerable:!1,writable:!0,configurable:!0}}),g(i,e)},u(e)}function r(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function d(e,t){return t&&("object"==typeof t||"function"==typeof t)?t:r(e)}function h(e){var t=o();return function(){var i,_=l(e);if(t){var n=l(this).constructor;i=Reflect.construct(_,arguments,n)}else i=_.apply(this,arguments);return d(this,i)}}function b(e,t){if(e){if("string"==typeof e)return m(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(e):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?m(e,t):void 0}}function m(e,t){(null==t||t>e.length)&&(t=e.length);for(var _=0,n=Array(t);_<t;_++)n[_]=e[_];return n}function c(e,t){var _;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(_=b(e))||t&&e&&"number"==typeof e.length){_&&(e=_);var n=0,l=function(){};return{s:l,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(t){throw t},f:l}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var g,a=!0,s=!1;return{s:function(){_=e[Symbol.iterator]()},n:function(){var e=_.next();return a=e.done,e},e:function(t){s=!0,g=t},f:function(){try{a||null==_.return||_.return()}finally{if(s)throw g}}}}var y=function(i){var g=Math.abs,o=Math.max;function l(e,i){var _;if(t(this,l),e>l.__kMaxLength)throw new RangeError("Maximum BigInt size exceeded");return _=a.call(this,e),_.sign=i,_}n(l,i);var a=h(l);return _(l,[{key:"toDebugString",value:function(){var e,t=["BigInt["],i=c(this);try{for(i.s();!(e=i.n()).done;){var _=e.value;t.push((_?(_>>>0).toString(16):_)+", ")}}catch(e){i.e(e)}finally{i.f()}return t.push("]"),t.join("")}},{key:"toString",value:function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:10;if(2>e||36<e)throw new RangeError("toString() radix argument must be between 2 and 36");return 0===this.length?"0":0==(e&e-1)?l.__toStringBasePowerOfTwo(this,e):l.__toStringGeneric(this,e,!1)}},{key:"__copy",value:function(){for(var e=new l(this.length,this.sign),t=0;t<this.length;t++)e[t]=this[t];return e}},{key:"__trim",value:function(){for(var e=this.length,t=this[e-1];0===t;)e--,t=this[e-1],this.pop();return 0===e&&(this.sign=!1),this}},{key:"__initializeDigits",value:function(){for(var e=0;e<this.length;e++)this[e]=0}},{key:"__clzmsd",value:function(){return l.__clz32(this[this.length-1])}},{key:"__inplaceMultiplyAdd",value:function(e,t,_){_>this.length&&(_=this.length);for(var n=65535&e,g=e>>>16,o=0,a=65535&t,s=t>>>16,u=0;u<_;u++){var r=this.__digit(u),d=65535&r,h=r>>>16,b=l.__imul(d,n),m=l.__imul(d,g),c=l.__imul(h,n),v=l.__imul(h,g),f=a+(65535&b),y=s+o+(f>>>16)+(b>>>16)+(65535&m)+(65535&c);a=(m>>>16)+(c>>>16)+(65535&v)+(y>>>16),o=a>>>16,a&=65535,s=v>>>16;this.__setDigit(u,65535&f|y<<16)}if(0!==o||0!==a||0!==s)throw new Error("implementation bug")}},{key:"__inplaceAdd",value:function(e,t,_){for(var n,l=0,g=0;g<_;g++)n=this.__halfDigit(t+g)+e.__halfDigit(g)+l,l=n>>>16,this.__setHalfDigit(t+g,n);return l}},{key:"__inplaceSub",value:function(e,t,_){var n=0;if(1&t){t>>=1;for(var l=this.__digit(t),g=65535&l,o=0;o<_-1>>>1;o++){var a=e.__digit(o),s=(l>>>16)-(65535&a)-n;n=1&s>>>16,this.__setDigit(t+o,s<<16|65535&g),l=this.__digit(t+o+1),g=(65535&l)-(a>>>16)-n,n=1&g>>>16}var u=e.__digit(o),r=(l>>>16)-(65535&u)-n;n=1&r>>>16,this.__setDigit(t+o,r<<16|65535&g);if(t+o+1>=this.length)throw new RangeError("out of bounds");0==(1&_)&&(l=this.__digit(t+o+1),g=(65535&l)-(u>>>16)-n,n=1&g>>>16,this.__setDigit(t+e.length,4294901760&l|65535&g))}else{t>>=1;for(var d=0;d<e.length-1;d++){var h=this.__digit(t+d),b=e.__digit(d),m=(65535&h)-(65535&b)-n;n=1&m>>>16;var c=(h>>>16)-(b>>>16)-n;n=1&c>>>16,this.__setDigit(t+d,c<<16|65535&m)}var v=this.__digit(t+d),f=e.__digit(d),y=(65535&v)-(65535&f)-n;n=1&y>>>16;var k=0;0==(1&_)&&(k=(v>>>16)-(f>>>16)-n,n=1&k>>>16),this.__setDigit(t+d,k<<16|65535&y)}return n}},{key:"__inplaceRightShift",value:function(e){if(0!==e){for(var t,_=this.__digit(0)>>>e,n=this.length-1,l=0;l<n;l++)t=this.__digit(l+1),this.__setDigit(l,t<<32-e|_),_=t>>>e;this.__setDigit(n,_)}}},{key:"__digit",value:function(e){return this[e]}},{key:"__unsignedDigit",value:function(e){return this[e]>>>0}},{key:"__setDigit",value:function(e,t){this[e]=0|t}},{key:"__setDigitGrow",value:function(e,t){this[e]=0|t}},{key:"__halfDigitLength",value:function(){var e=this.length;return 65535>=this.__unsignedDigit(e-1)?2*e-1:2*e}},{key:"__halfDigit",value:function(e){return 65535&this[e>>>1]>>>((1&e)<<4)}},{key:"__setHalfDigit",value:function(e,t){var i=e>>>1,_=this.__digit(i),n=1&e?65535&_|t<<16:4294901760&_|65535&t;this.__setDigit(i,n)}}],[{key:"BigInt",value:function(t){var i=Math.floor,_=Number.isFinite;if("number"==typeof t){if(0===t)return l.__zero();if((0|t)===t)return 0>t?l.__oneDigit(-t,!0):l.__oneDigit(t,!1);if(!_(t)||i(t)!==t)throw new RangeError("The number "+t+" cannot be converted to BigInt because it is not an integer");return l.__fromDouble(t)}if("string"==typeof t){var n=l.__fromString(t);if(null===n)throw new SyntaxError("Cannot convert "+t+" to a BigInt");return n}if("boolean"==typeof t)return!0===t?l.__oneDigit(1,!1):l.__zero();if("object"===e(t)){if(t.constructor===l)return t;var g=l.__toPrimitive(t);return l.BigInt(g)}throw new TypeError("Cannot convert "+t+" to a BigInt")}},{key:"toNumber",value:function(e){var t=e.length;if(0===t)return 0;if(1===t){var i=e.__unsignedDigit(0);return e.sign?-i:i}var _=e.__digit(t-1),n=l.__clz32(_),g=32*t-n;if(1024<g)return e.sign?-Infinity:1/0;var o=g-1,a=_,s=t-1,u=n+1,r=32===u?0:a<<u;r>>>=12;var d=u-12,h=12<=u?0:a<<20+u,b=20+u;0<d&&0<s&&(s--,a=e.__digit(s),r|=a>>>32-d,h=a<<d,b=d),0<b&&0<s&&(s--,a=e.__digit(s),h|=a>>>32-b,b-=32);var m=l.__decideRounding(e,b,s,a);if((1===m||0===m&&1==(1&h))&&(h=h+1>>>0,0===h&&(r++,0!=r>>>20&&(r=0,o++,1023<o))))return e.sign?-Infinity:1/0;var c=e.sign?-2147483648:0;return o=o+1023<<20,l.__kBitConversionInts[1]=c|o|r,l.__kBitConversionInts[0]=h,l.__kBitConversionDouble[0]}},{key:"unaryMinus",value:function(e){if(0===e.length)return e;var t=e.__copy();return t.sign=!e.sign,t}},{key:"bitwiseNot",value:function(e){return e.sign?l.__absoluteSubOne(e).__trim():l.__absoluteAddOne(e,!0)}},{key:"exponentiate",value:function(e,t){if(t.sign)throw new RangeError("Exponent must be positive");if(0===t.length)return l.__oneDigit(1,!1);if(0===e.length)return e;if(1===e.length&&1===e.__digit(0))return e.sign&&0==(1&t.__digit(0))?l.unaryMinus(e):e;if(1<t.length)throw new RangeError("BigInt too big");var i=t.__unsignedDigit(0);if(1===i)return e;if(i>=l.__kMaxLengthBits)throw new RangeError("BigInt too big");if(1===e.length&&2===e.__digit(0)){var _=1+(i>>>5),n=e.sign&&0!=(1&i),g=new l(_,n);g.__initializeDigits();var o=1<<(31&i);return g.__setDigit(_-1,o),g}var a=null,s=e;for(0!=(1&i)&&(a=e),i>>=1;0!==i;i>>=1)s=l.multiply(s,s),0!=(1&i)&&(null===a?a=s:a=l.multiply(a,s));return a}},{key:"multiply",value:function(e,t){if(0===e.length)return e;if(0===t.length)return t;var _=e.length+t.length;32<=e.__clzmsd()+t.__clzmsd()&&_--;var n=new l(_,e.sign!==t.sign);n.__initializeDigits();for(var g=0;g<e.length;g++)l.__multiplyAccumulate(t,e.__digit(g),n,g);return n.__trim()}},{key:"divide",value:function(e,t){if(0===t.length)throw new RangeError("Division by zero");if(0>l.__absoluteCompare(e,t))return l.__zero();var i,_=e.sign!==t.sign,n=t.__unsignedDigit(0);if(1===t.length&&65535>=n){if(1===n)return _===e.sign?e:l.unaryMinus(e);i=l.__absoluteDivSmall(e,n,null)}else i=l.__absoluteDivLarge(e,t,!0,!1);return i.sign=_,i.__trim()}},{key:"remainder",value:function e(t,i){if(0===i.length)throw new RangeError("Division by zero");if(0>l.__absoluteCompare(t,i))return t;var _=i.__unsignedDigit(0);if(1===i.length&&65535>=_){if(1===_)return l.__zero();var n=l.__absoluteModSmall(t,_);return 0===n?l.__zero():l.__oneDigit(n,t.sign)}var e=l.__absoluteDivLarge(t,i,!1,!0);return e.sign=t.sign,e.__trim()}},{key:"add",value:function(e,t){var i=e.sign;return i===t.sign?l.__absoluteAdd(e,t,i):0<=l.__absoluteCompare(e,t)?l.__absoluteSub(e,t,i):l.__absoluteSub(t,e,!i)}},{key:"subtract",value:function(e,t){var i=e.sign;return i===t.sign?0<=l.__absoluteCompare(e,t)?l.__absoluteSub(e,t,i):l.__absoluteSub(t,e,!i):l.__absoluteAdd(e,t,i)}},{key:"leftShift",value:function(e,t){return 0===t.length||0===e.length?e:t.sign?l.__rightShiftByAbsolute(e,t):l.__leftShiftByAbsolute(e,t)}},{key:"signedRightShift",value:function(e,t){return 0===t.length||0===e.length?e:t.sign?l.__leftShiftByAbsolute(e,t):l.__rightShiftByAbsolute(e,t)}},{key:"unsignedRightShift",value:function(){throw new TypeError("BigInts have no unsigned right shift; use >> instead")}},{key:"lessThan",value:function(e,t){return 0>l.__compareToBigInt(e,t)}},{key:"lessThanOrEqual",value:function(e,t){return 0>=l.__compareToBigInt(e,t)}},{key:"greaterThan",value:function(e,t){return 0<l.__compareToBigInt(e,t)}},{key:"greaterThanOrEqual",value:function(e,t){return 0<=l.__compareToBigInt(e,t)}},{key:"equal",value:function(e,t){if(e.sign!==t.sign)return!1;if(e.length!==t.length)return!1;for(var _=0;_<e.length;_++)if(e.__digit(_)!==t.__digit(_))return!1;return!0}},{key:"notEqual",value:function(e,t){return!l.equal(e,t)}},{key:"bitwiseAnd",value:function(e,t){if(!e.sign&&!t.sign)return l.__absoluteAnd(e,t).__trim();if(e.sign&&t.sign){var i=o(e.length,t.length)+1,_=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return _=l.__absoluteOr(_,n,_),l.__absoluteAddOne(_,!0,_).__trim()}if(e.sign){var g=[t,e];e=g[0],t=g[1]}return l.__absoluteAndNot(e,l.__absoluteSubOne(t)).__trim()}},{key:"bitwiseXor",value:function(e,t){if(!e.sign&&!t.sign)return l.__absoluteXor(e,t).__trim();if(e.sign&&t.sign){var i=o(e.length,t.length),_=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return l.__absoluteXor(_,n,_).__trim()}var g=o(e.length,t.length)+1;if(e.sign){var a=[t,e];e=a[0],t=a[1]}var s=l.__absoluteSubOne(t,g);return s=l.__absoluteXor(s,e,s),l.__absoluteAddOne(s,!0,s).__trim()}},{key:"bitwiseOr",value:function(e,t){var i=o(e.length,t.length);if(!e.sign&&!t.sign)return l.__absoluteOr(e,t).__trim();if(e.sign&&t.sign){var _=l.__absoluteSubOne(e,i),n=l.__absoluteSubOne(t);return _=l.__absoluteAnd(_,n,_),l.__absoluteAddOne(_,!0,_).__trim()}if(e.sign){var g=[t,e];e=g[0],t=g[1]}var a=l.__absoluteSubOne(t,i);return a=l.__absoluteAndNot(a,e,a),l.__absoluteAddOne(a,!0,a).__trim()}},{key:"asIntN",value:function(e,t){if(0===t.length)return t;if(0===e)return l.__zero();if(e>=l.__kMaxLengthBits)return t;var _=e+31>>>5;if(t.length<_)return t;var n=t.__unsignedDigit(_-1),g=1<<(31&e-1);if(t.length===_&&n<g)return t;if(!((n&g)===g))return l.__truncateToNBits(e,t);if(!t.sign)return l.__truncateAndSubFromPowerOfTwo(e,t,!0);if(0==(n&g-1)){for(var o=_-2;0<=o;o--)if(0!==t.__digit(o))return l.__truncateAndSubFromPowerOfTwo(e,t,!1);return t.length===_&&n===g?t:l.__truncateToNBits(e,t)}return l.__truncateAndSubFromPowerOfTwo(e,t,!1)}},{key:"asUintN",value:function(e,t){if(0===t.length)return t;if(0===e)return l.__zero();if(t.sign){if(e>l.__kMaxLengthBits)throw new RangeError("BigInt too big");return l.__truncateAndSubFromPowerOfTwo(e,t,!1)}if(e>=l.__kMaxLengthBits)return t;var i=e+31>>>5;if(t.length<i)return t;var _=31&e;if(t.length==i){if(0===_)return t;var n=t.__digit(i-1);if(0==n>>>_)return t}return l.__truncateToNBits(e,t)}},{key:"ADD",value:function(e,t){if(e=l.__toPrimitive(e),t=l.__toPrimitive(t),"string"==typeof e)return"string"!=typeof t&&(t=t.toString()),e+t;if("string"==typeof t)return e.toString()+t;if(e=l.__toNumeric(e),t=l.__toNumeric(t),l.__isBigInt(e)&&l.__isBigInt(t))return l.add(e,t);if("number"==typeof e&&"number"==typeof t)return e+t;throw new TypeError("Cannot mix BigInt and other types, use explicit conversions")}},{key:"LT",value:function(e,t){return l.__compare(e,t,0)}},{key:"LE",value:function(e,t){return l.__compare(e,t,1)}},{key:"GT",value:function(e,t){return l.__compare(e,t,2)}},{key:"GE",value:function(e,t){return l.__compare(e,t,3)}},{key:"EQ",value:function(t,i){for(;;){if(l.__isBigInt(t))return l.__isBigInt(i)?l.equal(t,i):l.EQ(i,t);if("number"==typeof t){if(l.__isBigInt(i))return l.__equalToNumber(i,t);if("object"!==e(i))return t==i;i=l.__toPrimitive(i)}else if("string"==typeof t){if(l.__isBigInt(i))return t=l.__fromString(t),null!==t&&l.equal(t,i);if("object"!==e(i))return t==i;i=l.__toPrimitive(i)}else if("boolean"==typeof t){if(l.__isBigInt(i))return l.__equalToNumber(i,+t);if("object"!==e(i))return t==i;i=l.__toPrimitive(i)}else if("symbol"===e(t)){if(l.__isBigInt(i))return!1;if("object"!==e(i))return t==i;i=l.__toPrimitive(i)}else if("object"===e(t)){if("object"===e(i)&&i.constructor!==l)return t==i;t=l.__toPrimitive(t)}else return t==i}}},{key:"NE",value:function(e,t){return!l.EQ(e,t)}},{key:"__zero",value:function(){return new l(0,!1)}},{key:"__oneDigit",value:function(e,t){var i=new l(1,t);return i.__setDigit(0,e),i}},{key:"__decideRounding",value:function(e,t,i,_){if(0<t)return-1;var n;if(0>t)n=-t-1;else{if(0===i)return-1;i--,_=e.__digit(i),n=31}var l=1<<n;if(0==(_&l))return-1;if(l-=1,0!=(_&l))return 1;for(;0<i;)if(i--,0!==e.__digit(i))return 1;return 0}},{key:"__fromDouble",value:function(e){l.__kBitConversionDouble[0]=e;var t,i=2047&l.__kBitConversionInts[1]>>>20,_=i-1023,n=(_>>>5)+1,g=new l(n,0>e),o=1048575&l.__kBitConversionInts[1]|1048576,a=l.__kBitConversionInts[0],s=20,u=31&_,r=0;if(u<s){var d=s-u;r=d+32,t=o>>>d,o=o<<32-d|a>>>d,a<<=32-d}else if(u===s)r=32,t=o,o=a;else{var h=u-s;r=32-h,t=o<<h|a>>>32-h,o=a<<h}g.__setDigit(n-1,t);for(var b=n-2;0<=b;b--)0<r?(r-=32,t=o,o=a):t=0,g.__setDigit(b,t);return g.__trim()}},{key:"__isWhitespace",value:function(e){return!!(13>=e&&9<=e)||(159>=e?32==e:131071>=e?160==e||5760==e:196607>=e?(e&=131071,10>=e||40==e||41==e||47==e||95==e||4096==e):65279==e)}},{key:"__fromString",value:function(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:0,i=0,_=e.length,n=0;if(n===_)return l.__zero();for(var g=e.charCodeAt(n);l.__isWhitespace(g);){if(++n===_)return l.__zero();g=e.charCodeAt(n)}if(43===g){if(++n===_)return null;g=e.charCodeAt(n),i=1}else if(45===g){if(++n===_)return null;g=e.charCodeAt(n),i=-1}if(0===t){if(t=10,48===g){if(++n===_)return l.__zero();if(g=e.charCodeAt(n),88===g||120===g){if(t=16,++n===_)return null;g=e.charCodeAt(n)}else if(79===g||111===g){if(t=8,++n===_)return null;g=e.charCodeAt(n)}else if(66===g||98===g){if(t=2,++n===_)return null;g=e.charCodeAt(n)}}}else if(16===t&&48===g){if(++n===_)return l.__zero();if(g=e.charCodeAt(n),88===g||120===g){if(++n===_)return null;g=e.charCodeAt(n)}}for(;48===g;){if(++n===_)return l.__zero();g=e.charCodeAt(n)}var o=_-n,a=l.__kMaxBitsPerChar[t],s=l.__kBitsPerCharTableMultiplier-1;if(o>1073741824/a)return null;var u=a*o+s>>>l.__kBitsPerCharTableShift,r=new l(u+31>>>5,!1),h=10>t?t:10,b=10<t?t-10:0;if(0==(t&t-1)){a>>=l.__kBitsPerCharTableShift;var c=[],v=[],f=!1;do{for(var y,k=0,D=0;;){if(y=void 0,g-48>>>0<h)y=g-48;else if((32|g)-97>>>0<b)y=(32|g)-87;else{f=!0;break}if(D+=a,k=k<<a|y,++n===_){f=!0;break}if(g=e.charCodeAt(n),32<D+a)break}c.push(k),v.push(D)}while(!f);l.__fillFromParts(r,c,v)}else{r.__initializeDigits();var p=!1,B=0;do{for(var S,C=0,A=1;;){if(S=void 0,g-48>>>0<h)S=g-48;else if((32|g)-97>>>0<b)S=(32|g)-87;else{p=!0;break}var T=A*t;if(4294967295<T)break;if(A=T,C=C*t+S,B++,++n===_){p=!0;break}g=e.charCodeAt(n)}s=32*l.__kBitsPerCharTableMultiplier-1;var m=a*B+s>>>l.__kBitsPerCharTableShift+5;r.__inplaceMultiplyAdd(A,C,m)}while(!p)}if(n!==_){if(!l.__isWhitespace(g))return null;for(n++;n<_;n++)if(g=e.charCodeAt(n),!l.__isWhitespace(g))return null}return 0!==i&&10!==t?null:(r.sign=-1===i,r.__trim())}},{key:"__fillFromParts",value:function(e,t,_){for(var n=0,l=0,g=0,o=t.length-1;0<=o;o--){var a=t[o],s=_[o];l|=a<<g,g+=s,32===g?(e.__setDigit(n++,l),g=0,l=0):32<g&&(e.__setDigit(n++,l),g-=32,l=a>>>s-g)}if(0!==l){if(n>=e.length)throw new Error("implementation bug");e.__setDigit(n++,l)}for(;n<e.length;n++)e.__setDigit(n,0)}},{key:"__toStringBasePowerOfTwo",value:function(e,t){var _=e.length,n=t-1;n=(85&n>>>1)+(85&n),n=(51&n>>>2)+(51&n),n=(15&n>>>4)+(15&n);var g=n,o=t-1,a=e.__digit(_-1),s=l.__clz32(a),u=0|(32*_-s+g-1)/g;if(e.sign&&u++,268435456<u)throw new Error("string too long");for(var r=Array(u),d=u-1,h=0,b=0,m=0;m<_-1;m++){var c=e.__digit(m),v=(h|c<<b)&o;r[d--]=l.__kConversionChars[v];var f=g-b;for(h=c>>>f,b=32-f;b>=g;)r[d--]=l.__kConversionChars[h&o],h>>>=g,b-=g}var y=(h|a<<b)&o;for(r[d--]=l.__kConversionChars[y],h=a>>>g-b;0!==h;)r[d--]=l.__kConversionChars[h&o],h>>>=g;if(e.sign&&(r[d--]="-"),-1!==d)throw new Error("implementation bug");return r.join("")}},{key:"__toStringGeneric",value:function(e,t,_){var n=e.length;if(0===n)return"";if(1===n){var g=e.__unsignedDigit(0).toString(t);return!1===_&&e.sign&&(g="-"+g),g}var o=32*n-l.__clz32(e.__digit(n-1)),a=l.__kMaxBitsPerChar[t],s=a-1,u=o*l.__kBitsPerCharTableMultiplier;u+=s-1,u=0|u/s;var r,d,h=u+1>>1,b=l.exponentiate(l.__oneDigit(t,!1),l.__oneDigit(h,!1)),m=b.__unsignedDigit(0);if(1===b.length&&65535>=m){r=new l(e.length,!1),r.__initializeDigits();for(var c,v=0,f=2*e.length-1;0<=f;f--)c=v<<16|e.__halfDigit(f),r.__setHalfDigit(f,0|c/m),v=0|c%m;d=v.toString(t)}else{var y=l.__absoluteDivLarge(e,b,!0,!0);r=y.quotient;var k=y.remainder.__trim();d=l.__toStringGeneric(k,t,!0)}r.__trim();for(var D=l.__toStringGeneric(r,t,!0);d.length<h;)d="0"+d;return!1===_&&e.sign&&(D="-"+D),D+d}},{key:"__unequalSign",value:function(e){return e?-1:1}},{key:"__absoluteGreater",value:function(e){return e?-1:1}},{key:"__absoluteLess",value:function(e){return e?1:-1}},{key:"__compareToBigInt",value:function(e,t){var i=e.sign;if(i!==t.sign)return l.__unequalSign(i);var _=l.__absoluteCompare(e,t);return 0<_?l.__absoluteGreater(i):0>_?l.__absoluteLess(i):0}},{key:"__compareToNumber",value:function(e,t){if(!0|t){var i=e.sign,_=0>t;if(i!==_)return l.__unequalSign(i);if(0===e.length){if(_)throw new Error("implementation bug");return 0===t?0:-1}if(1<e.length)return l.__absoluteGreater(i);var n=g(t),o=e.__unsignedDigit(0);return o>n?l.__absoluteGreater(i):o<n?l.__absoluteLess(i):0}return l.__compareToDouble(e,t)}},{key:"__compareToDouble",value:function(e,t){if(t!==t)return t;if(t===1/0)return-1;if(t===-Infinity)return 1;var i=e.sign;if(i!==0>t)return l.__unequalSign(i);if(0===t)throw new Error("implementation bug: should be handled elsewhere");if(0===e.length)return-1;l.__kBitConversionDouble[0]=t;var _=2047&l.__kBitConversionInts[1]>>>20;if(2047==_)throw new Error("implementation bug: handled elsewhere");var n=_-1023;if(0>n)return l.__absoluteGreater(i);var g=e.length,o=e.__digit(g-1),a=l.__clz32(o),s=32*g-a,u=n+1;if(s<u)return l.__absoluteLess(i);if(s>u)return l.__absoluteGreater(i);var r=1048576|1048575&l.__kBitConversionInts[1],d=l.__kBitConversionInts[0],h=20,b=31-a;if(b!==(s-1)%31)throw new Error("implementation bug");var m,c=0;if(b<h){var v=h-b;c=v+32,m=r>>>v,r=r<<32-v|d>>>v,d<<=32-v}else if(b===h)c=32,m=r,r=d;else{var f=b-h;c=32-f,m=r<<f|d>>>32-f,r=d<<f}if(o>>>=0,m>>>=0,o>m)return l.__absoluteGreater(i);if(o<m)return l.__absoluteLess(i);for(var y=g-2;0<=y;y--){0<c?(c-=32,m=r>>>0,r=d,d=0):m=0;var k=e.__unsignedDigit(y);if(k>m)return l.__absoluteGreater(i);if(k<m)return l.__absoluteLess(i)}if(0!==r||0!==d){if(0===c)throw new Error("implementation bug");return l.__absoluteLess(i)}return 0}},{key:"__equalToNumber",value:function(e,t){return t|0===t?0===t?0===e.length:1===e.length&&e.sign===0>t&&e.__unsignedDigit(0)===g(t):0===l.__compareToDouble(e,t)}},{key:"__comparisonResultToBool",value:function(e,t){switch(t){case 0:return 0>e;case 1:return 0>=e;case 2:return 0<e;case 3:return 0<=e;}throw new Error("unreachable")}},{key:"__compare",value:function(e,t,i){if(e=l.__toPrimitive(e),t=l.__toPrimitive(t),"string"==typeof e&&"string"==typeof t)switch(i){case 0:return e<t;case 1:return e<=t;case 2:return e>t;case 3:return e>=t;}if(l.__isBigInt(e)&&"string"==typeof t)return t=l.__fromString(t),null!==t&&l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if("string"==typeof e&&l.__isBigInt(t))return e=l.__fromString(e),null!==e&&l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if(e=l.__toNumeric(e),t=l.__toNumeric(t),l.__isBigInt(e)){if(l.__isBigInt(t))return l.__comparisonResultToBool(l.__compareToBigInt(e,t),i);if("number"!=typeof t)throw new Error("implementation bug");return l.__comparisonResultToBool(l.__compareToNumber(e,t),i)}if("number"!=typeof e)throw new Error("implementation bug");if(l.__isBigInt(t))return l.__comparisonResultToBool(l.__compareToNumber(t,e),2^i);if("number"!=typeof t)throw new Error("implementation bug");return 0===i?e<t:1===i?e<=t:2===i?e>t:3===i?e>=t:void 0}},{key:"__absoluteAdd",value:function(e,t,_){if(e.length<t.length)return l.__absoluteAdd(t,e,_);if(0===e.length)return e;if(0===t.length)return e.sign===_?e:l.unaryMinus(e);var n=e.length;(0===e.__clzmsd()||t.length===e.length&&0===t.__clzmsd())&&n++;for(var g=new l(n,_),o=0,a=0;a<t.length;a++){var s=t.__digit(a),u=e.__digit(a),r=(65535&u)+(65535&s)+o,d=(u>>>16)+(s>>>16)+(r>>>16);o=d>>>16,g.__setDigit(a,65535&r|d<<16)}for(;a<e.length;a++){var h=e.__digit(a),b=(65535&h)+o,m=(h>>>16)+(b>>>16);o=m>>>16,g.__setDigit(a,65535&b|m<<16)}return a<g.length&&g.__setDigit(a,o),g.__trim()}},{key:"__absoluteSub",value:function(e,t,_){if(0===e.length)return e;if(0===t.length)return e.sign===_?e:l.unaryMinus(e);for(var n=new l(e.length,_),g=0,o=0;o<t.length;o++){var a=e.__digit(o),s=t.__digit(o),u=(65535&a)-(65535&s)-g;g=1&u>>>16;var r=(a>>>16)-(s>>>16)-g;g=1&r>>>16,n.__setDigit(o,65535&u|r<<16)}for(;o<e.length;o++){var d=e.__digit(o),h=(65535&d)-g;g=1&h>>>16;var b=(d>>>16)-g;g=1&b>>>16,n.__setDigit(o,65535&h|b<<16)}return n.__trim()}},{key:"__absoluteAddOne",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length;null===_?_=new l(n,t):_.sign=t;for(var g,o=!0,a=0;a<n;a++){if(g=e.__digit(a),o){var s=-1===g;g=0|g+1,o=s}_.__setDigit(a,g)}return o&&_.__setDigitGrow(n,1),_}},{key:"__absoluteSubOne",value:function(e,t){var _=e.length;t=t||_;for(var n,g=new l(t,!1),o=!0,a=0;a<_;a++){if(n=e.__digit(a),o){var s=0===n;n=0|n-1,o=s}g.__setDigit(a,n)}if(o)throw new Error("implementation bug");for(var u=_;u<t;u++)g.__setDigit(u,0);return g}},{key:"__absoluteAnd",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s}var u=o;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)&t.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteAndNot",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;n<g&&(o=n);var a=n;null===_?_=new l(a,!1):a=_.length;for(var s=0;s<o;s++)_.__setDigit(s,e.__digit(s)&~t.__digit(s));for(;s<n;s++)_.__setDigit(s,e.__digit(s));for(;s<a;s++)_.__setDigit(s,0);return _}},{key:"__absoluteOr",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s}var u=n;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)|t.__digit(r));for(;r<n;r++)_.__setDigit(r,e.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteXor",value:function(e,t){var _=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,n=e.length,g=t.length,o=g;if(n<g){o=n;var a=e,s=n;e=t,n=g,t=a,g=s}var u=n;null===_?_=new l(u,!1):u=_.length;for(var r=0;r<o;r++)_.__setDigit(r,e.__digit(r)^t.__digit(r));for(;r<n;r++)_.__setDigit(r,e.__digit(r));for(;r<u;r++)_.__setDigit(r,0);return _}},{key:"__absoluteCompare",value:function(e,t){var _=e.length-t.length;if(0!=_)return _;for(var n=e.length-1;0<=n&&e.__digit(n)===t.__digit(n);)n--;return 0>n?0:e.__unsignedDigit(n)>t.__unsignedDigit(n)?1:-1}},{key:"__multiplyAccumulate",value:function(e,t,_,n){if(0!==t){for(var g=65535&t,o=t>>>16,a=0,s=0,u=0,r=0;r<e.length;r++,n++){var d=_.__digit(n),h=65535&d,b=d>>>16,m=e.__digit(r),c=65535&m,v=m>>>16,f=l.__imul(c,g),y=l.__imul(c,o),k=l.__imul(v,g),D=l.__imul(v,o);h+=s+(65535&f),b+=u+a+(h>>>16)+(f>>>16)+(65535&y)+(65535&k),a=b>>>16,s=(y>>>16)+(k>>>16)+(65535&D)+a,a=s>>>16,s&=65535,u=D>>>16,d=65535&h|b<<16,_.__setDigit(n,d)}for(;0!==a||0!==s||0!==u;n++){var p=_.__digit(n),B=(65535&p)+s,S=(p>>>16)+(B>>>16)+u+a;s=0,u=0,a=S>>>16,p=65535&B|S<<16,_.__setDigit(n,p)}}}},{key:"__internalMultiplyAdd",value:function(e,t,_,g,o){for(var a=_,s=0,u=0;u<g;u++){var r=e.__digit(u),d=l.__imul(65535&r,t),h=(65535&d)+s+a;a=h>>>16;var b=l.__imul(r>>>16,t),m=(65535&b)+(d>>>16)+a;a=m>>>16,s=b>>>16,o.__setDigit(u,m<<16|65535&h)}if(o.length>g)for(o.__setDigit(g++,a+s);g<o.length;)o.__setDigit(g++,0);else if(0!==a+s)throw new Error("implementation bug")}},{key:"__absoluteDivSmall",value:function(e,t,_){null===_&&(_=new l(e.length,!1));for(var n=0,g=2*e.length-1;0<=g;g-=2){var o=(n<<16|e.__halfDigit(g))>>>0,a=0|o/t;n=0|o%t,o=(n<<16|e.__halfDigit(g-1))>>>0;var s=0|o/t;n=0|o%t,_.__setDigit(g>>>1,a<<16|s)}return _}},{key:"__absoluteModSmall",value:function(e,t){for(var _,n=0,l=2*e.length-1;0<=l;l--)_=(n<<16|e.__halfDigit(l))>>>0,n=0|_%t;return n}},{key:"__absoluteDivLarge",value:function(e,t,i,_){var g=t.__halfDigitLength(),n=t.length,o=e.__halfDigitLength()-g,a=null;i&&(a=new l(o+2>>>1,!1),a.__initializeDigits());var s=new l(g+2>>>1,!1);s.__initializeDigits();var r=l.__clz16(t.__halfDigit(g-1));0<r&&(t=l.__specialLeftShift(t,r,0));for(var d=l.__specialLeftShift(e,r,1),u=t.__halfDigit(g-1),h=0,b=o;0<=b;b--){var m=65535,v=d.__halfDigit(b+g);if(v!==u){var f=(v<<16|d.__halfDigit(b+g-1))>>>0;m=0|f/u;for(var y=0|f%u,k=t.__halfDigit(g-2),D=d.__halfDigit(b+g-2);l.__imul(m,k)>>>0>(y<<16|D)>>>0&&(m--,y+=u,!(65535<y)););}l.__internalMultiplyAdd(t,m,0,n,s);var p=d.__inplaceSub(s,b,g+1);0!==p&&(p=d.__inplaceAdd(t,b,g),d.__setHalfDigit(b+g,d.__halfDigit(b+g)+p),m--),i&&(1&b?h=m<<16:a.__setDigit(b>>>1,h|m))}return _?(d.__inplaceRightShift(r),i?{quotient:a,remainder:d}:d):i?a:void 0}},{key:"__clz16",value:function(e){return l.__clz32(e)-16}},{key:"__specialLeftShift",value:function(e,t,_){var g=e.length,n=new l(g+_,!1);if(0===t){for(var o=0;o<g;o++)n.__setDigit(o,e.__digit(o));return 0<_&&n.__setDigit(g,0),n}for(var a,s=0,u=0;u<g;u++)a=e.__digit(u),n.__setDigit(u,a<<t|s),s=a>>>32-t;return 0<_&&n.__setDigit(g,s),n}},{key:"__leftShiftByAbsolute",value:function(e,t){var _=l.__toShiftAmount(t);if(0>_)throw new RangeError("BigInt too big");var n=_>>>5,g=31&_,o=e.length,a=0!==g&&0!=e.__digit(o-1)>>>32-g,s=o+n+(a?1:0),u=new l(s,e.sign);if(0===g){for(var r=0;r<n;r++)u.__setDigit(r,0);for(;r<s;r++)u.__setDigit(r,e.__digit(r-n))}else{for(var h=0,b=0;b<n;b++)u.__setDigit(b,0);for(var m,c=0;c<o;c++)m=e.__digit(c),u.__setDigit(c+n,m<<g|h),h=m>>>32-g;if(a)u.__setDigit(o+n,h);else if(0!==h)throw new Error("implementation bug")}return u.__trim()}},{key:"__rightShiftByAbsolute",value:function(e,t){var _=e.length,n=e.sign,g=l.__toShiftAmount(t);if(0>g)return l.__rightShiftByMaximum(n);var o=g>>>5,a=31&g,s=_-o;if(0>=s)return l.__rightShiftByMaximum(n);var u=!1;if(n){if(0!=(e.__digit(o)&(1<<a)-1))u=!0;else for(var r=0;r<o;r++)if(0!==e.__digit(r)){u=!0;break}}if(u&&0===a){var h=e.__digit(_-1);0==~h&&s++}var b=new l(s,n);if(0===a)for(var m=o;m<_;m++)b.__setDigit(m-o,e.__digit(m));else{for(var c,v=e.__digit(o)>>>a,f=_-o-1,y=0;y<f;y++)c=e.__digit(y+o+1),b.__setDigit(y,c<<32-a|v),v=c>>>a;b.__setDigit(f,v)}return u&&(b=l.__absoluteAddOne(b,!0,b)),b.__trim()}},{key:"__rightShiftByMaximum",value:function(e){return e?l.__oneDigit(1,!0):l.__zero()}},{key:"__toShiftAmount",value:function(e){if(1<e.length)return-1;var t=e.__unsignedDigit(0);return t>l.__kMaxLengthBits?-1:t}},{key:"__toPrimitive",value:function(t){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"default";if("object"!==e(t))return t;if(t.constructor===l)return t;var _=t[Symbol.toPrimitive];if(_){var n=_(i);if("object"!==e(n))return n;throw new TypeError("Cannot convert object to primitive value")}var g=t.valueOf;if(g){var o=g.call(t);if("object"!==e(o))return o}var a=t.toString;if(a){var s=a.call(t);if("object"!==e(s))return s}throw new TypeError("Cannot convert object to primitive value")}},{key:"__toNumeric",value:function(e){return l.__isBigInt(e)?e:+e}},{key:"__isBigInt",value:function(t){return"object"===e(t)&&t.constructor===l}},{key:"__truncateToNBits",value:function(e,t){for(var _=e+31>>>5,n=new l(_,t.sign),g=_-1,o=0;o<g;o++)n.__setDigit(o,t.__digit(o));var a=t.__digit(g);if(0!=(31&e)){var s=32-(31&e);a=a<<s>>>s}return n.__setDigit(g,a),n.__trim()}},{key:"__truncateAndSubFromPowerOfTwo",value:function(e,t,_){for(var n=Math.min,g=e+31>>>5,o=new l(g,_),a=0,s=g-1,u=0,r=n(s,t.length);a<r;a++){var d=t.__digit(a),h=0-(65535&d)-u;u=1&h>>>16;var b=0-(d>>>16)-u;u=1&b>>>16,o.__setDigit(a,65535&h|b<<16)}for(;a<s;a++)o.__setDigit(a,0|-u);var m,c=s<t.length?t.__digit(s):0,v=31&e;if(0===v){var f=0-(65535&c)-u;u=1&f>>>16;var y=0-(c>>>16)-u;m=65535&f|y<<16}else{var k=32-v;c=c<<k>>>k;var D=1<<32-k,p=(65535&D)-(65535&c)-u;u=1&p>>>16;var B=(D>>>16)-(c>>>16)-u;m=65535&p|B<<16,m&=D-1}return o.__setDigit(s,m),o.__trim()}},{key:"__digitPow",value:function(e,t){for(var i=1;0<t;)1&t&&(i*=e),t>>>=1,e*=e;return i}}]),l}(u(Array));return y.__kMaxLength=33554432,y.__kMaxLengthBits=y.__kMaxLength<<5,y.__kMaxBitsPerChar=[0,0,32,51,64,75,83,90,96,102,107,111,115,119,122,126,128,131,134,136,139,141,143,145,147,149,151,153,154,156,158,159,160,162,163,165,166],y.__kBitsPerCharTableShift=5,y.__kBitsPerCharTableMultiplier=1<<y.__kBitsPerCharTableShift,y.__kConversionChars=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],y.__kBitConversionBuffer=new ArrayBuffer(8),y.__kBitConversionDouble=new Float64Array(y.__kBitConversionBuffer),y.__kBitConversionInts=new Int32Array(y.__kBitConversionBuffer),y.__clz32=f||function(e){var t=Math.LN2,i=Math.log;return 0===e?32:0|31-(0|i(e>>>0)/t)},y.__imul=v||function(e,t){return 0|e*t},y});
    
    },{}],5:[function(require,module,exports){
    const CONST = require('./const')
    const { isHexString, isString } = require('./utils')
    
    /**
     * Check conflux address's prefix
     *
     * @param address {string}
     * @return {boolean}
     *
     * @example
     */
    function hasNetworkPrefix (address) {
      if (!isString(address)) {
        return false
      }
      const parts = address.toLowerCase().split(':')
      if (parts.length !== 2 && parts.length !== 3) {
        return false
      }
      const prefix = parts[0]
      if (prefix === CONST.PREFIX_CFX || prefix === CONST.PREFIX_CFXTEST) {
        return true
      }
      return (
        prefix.startsWith(CONST.PREFIX_NET) && /^([1-9]\d*)$/.test(prefix.slice(3))
      )
    }
    
    /**
     * simplify a verbose address(return a non-verbose address)
     *
     * @param address {string}
     * @return {string}
     *
     */
    function simplifyCfxAddress (address) {
      if (!hasNetworkPrefix(address)) {
        throw new Error('invalid base32 address')
      }
      const parts = address.toLocaleLowerCase().split(':')
      if (parts.length !== 3) {
        return address
      }
      return `${parts[0]}:${parts[2]}`
    }
    
    function shortenCfxAddress (address, compress = false) {
      address = simplifyCfxAddress(address)
      const [netPre, body] = address.split(':')
      const tailLen = netPre === 'cfx' && !compress ? 8 : 4
      const pre = body.slice(0, 3)
      const tail = body.slice(body.length - tailLen)
      return `${netPre}:${pre}...${tail}`
    }
    
    function isZeroAddress (address) {
      if (!isHexString(address)) throw new Error('Only hex is allowed')
      return address === CONST.ZERO_ADDRESS_HEX
    }
    
    function isInternalContractAddress (address) {
      if (!isHexString(address)) throw new Error('Only hex is allowed')
      return (
        address === CONST.ADMIN_CONTROL ||
        address === CONST.SPONSOR_CONTROL ||
        address === CONST.STAKING ||
        address === CONST.CONFLUX_CONTEXT ||
        address === CONST.POS_REGISTER ||
        address === CONST.CROSS_SPACE_CALL ||
        address === CONST.PARAMS_CONTROL
      )
    }
    
    function isValidHexAddress (address) {
      return isHexString(address) && address.length === 42
    }
    
    // TOOD check address's checksum
    function isValidCfxHexAddress (address) {
      if (address.length !== 42) return false
      if (isZeroAddress(address) || isInternalContractAddress(address)) return true
      return address.startsWith('0x1') || address.startsWith('0x8')
    }
    
    module.exports = {
      hasNetworkPrefix,
      simplifyCfxAddress,
      shortenCfxAddress,
      isZeroAddress,
      isInternalContractAddress,
      isValidHexAddress,
      isValidCfxHexAddress
    }
    
    },{"./const":9,"./utils":10}],6:[function(require,module,exports){
    const { encode, decode } = require('./cip37/pure-js-cip37')
    const { ...rest } = require('./address-utils')
    const { isString } = require('./utils')
    
    /**
     * Check whether a given address is valid, will return a boolean value
     *
     * @param address {string}
     * @return {boolean}
     *
     */
    function isValidCfxAddress (address) {
      if (!isString(address)) {
        return false
      }
      try {
        decode(address)
        return true
      } catch (e) {
        return false
      }
    }
    
    /**
     * Check whether a given address is valid, if not valid will throw an error
     *
     * @param address {string}
     *
     */
    function verifyCfxAddress (address) {
      decode(address)
      return true
    }
    
    module.exports = {
      encode,
      decode,
      isValidCfxAddress,
      verifyCfxAddress,
      ...rest
    }
    
    },{"./address-utils":5,"./cip37/pure-js-cip37":8,"./utils":10}],7:[function(require,module,exports){
    const JSBI = require('jsbi')
    const ALPHABET = 'ABCDEFGHJKMNPRSTUVWXYZ0123456789'
    
    const ALPHABET_MAP = {}
    for (let z = 0; z < ALPHABET.length; z++) {
      const x = ALPHABET.charAt(z)
      if (ALPHABET_MAP[x] !== undefined) {
        throw new TypeError(x + ' is ambiguous')
      }
      ALPHABET_MAP[x] = z
    }
    
    // pre defined BigInt could faster about 40 percent
    const BIGINT_0 = JSBI.BigInt(0)
    const BIGINT_1 = JSBI.BigInt(1)
    const BIGINT_5 = JSBI.BigInt(5)
    const BIGINT_35 = JSBI.BigInt(35)
    const BIGINT_0B00001 = JSBI.BigInt(0b00001)
    const BIGINT_0B00010 = JSBI.BigInt(0b00010)
    const BIGINT_0B00100 = JSBI.BigInt(0b00100)
    const BIGINT_0B01000 = JSBI.BigInt(0b01000)
    const BIGINT_0B10000 = JSBI.BigInt(0b10000)
    const BIGINT_0X07FFFFFFFF = JSBI.BigInt(0x07ffffffff)
    const BIGINT_0X98F2BC8E61 = JSBI.BigInt(0x98f2bc8e61)
    const BIGINT_0X79B76D99E2 = JSBI.BigInt(0x79b76d99e2)
    const BIGINT_0XF33E5FB3C4 = JSBI.BigInt(0xf33e5fb3c4)
    const BIGINT_0XAE2EABE2A8 = JSBI.BigInt(0xae2eabe2a8)
    const BIGINT_0X1E4F43E470 = JSBI.BigInt(0x1e4f43e470)
    
    function convertBit (buffer, inBits, outBits, pad) {
      const mask = (1 << outBits) - 1
      const array = []
    
      let bits = 0
      let value = 0
      for (const byte of buffer) {
        bits += inBits
        value = (value << inBits) | byte
    
        while (bits >= outBits) {
          bits -= outBits
          array.push((value >>> bits) & mask)
        }
      }
      value = (value << (outBits - bits)) & mask
    
      if (bits && pad) {
        array.push(value)
      } else if (value && !pad) {
        throw new Error('Excess padding')
      } else if (bits >= inBits && !pad) {
        throw new Error('Non-zero padding')
      }
    
      return array
    }
    
    function polyMod (buffer) {
      let checksumBigInt = BIGINT_1
      for (const byte of buffer) {
        // c0 = c >> 35;
        const high = JSBI.signedRightShift(checksumBigInt, BIGINT_35) // XXX: checksumBigInt must be positive, signedRightShift is ok
    
        // c = ((c & 0x07ffffffff) << 5) ^ d;
        checksumBigInt = JSBI.bitwiseAnd(checksumBigInt, BIGINT_0X07FFFFFFFF)
        checksumBigInt = JSBI.leftShift(checksumBigInt, BIGINT_5)
        checksumBigInt = byte ? JSBI.bitwiseXor(checksumBigInt, JSBI.BigInt(byte)) : checksumBigInt // bit ^ 0 = bit
    
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00001), BIGINT_0)) {
          checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X98F2BC8E61)
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00010), BIGINT_0)) {
          checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X79B76D99E2)
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B00100), BIGINT_0)) {
          checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0XF33E5FB3C4)
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B01000), BIGINT_0)) {
          checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0XAE2EABE2A8)
        }
        if (JSBI.notEqual(JSBI.bitwiseAnd(high, BIGINT_0B10000), BIGINT_0)) {
          checksumBigInt = JSBI.bitwiseXor(checksumBigInt, BIGINT_0X1E4F43E470)
        }
      }
    
      return JSBI.bitwiseXor(checksumBigInt, BIGINT_1)
    }
    
    module.exports = {
      convertBit,
      polyMod,
      ALPHABET,
      ALPHABET_MAP
    }
    
    },{"jsbi":4}],8:[function(require,module,exports){
    (function (Buffer){(function (){
    const {
      ALPHABET,
      ALPHABET_MAP,
      polyMod,
      convertBit
    } = require('./base32')
    const CONST = require('../const')
    const { isHexString } = require('../utils')
    
    const VERSION_BYTE = 0
    const NET_ID_LIMIT = 0xFFFFFFFF
    
    function encodeNetId (netId) {
      if (!Number.isInteger(netId)) {
        throw new Error('netId should be passed as an integer')
      }
      if (netId < 0 || netId > NET_ID_LIMIT) {
        throw new Error('netId should be passed as in range [0, 0xFFFFFFFF]')
      }
    
      switch (netId) {
        case CONST.NETID_TEST:
          return CONST.PREFIX_CFXTEST
        case CONST.NETID_MAIN:
          return CONST.PREFIX_CFX
        default:
          return `${CONST.PREFIX_NET}${netId}`
      }
    }
    
    function isValidNetId (netId) {
      return /^([1-9]\d*)$/.test(netId) && Number(netId) <= NET_ID_LIMIT
    }
    
    function decodeNetId (payload) {
      switch (payload) {
        case CONST.PREFIX_CFXTEST:
          return CONST.NETID_TEST
        case CONST.PREFIX_CFX:
          return CONST.NETID_MAIN
        default: {
          const prefix = payload.slice(0, 3)
          const netId = payload.slice(3)
          if (prefix !== CONST.PREFIX_NET || !isValidNetId(netId)) {
            throw new Error("netId prefix should be passed by 'cfx', 'cfxtest' or 'net[n]' ")
          }
          if (Number(netId) === CONST.NETID_TEST || Number(netId) === CONST.NETID_MAIN) {
            throw new Error('net1 or net1029 are invalid')
          }
          return Number(netId)
        }
      }
    }
    
    function getAddressType (hexAddress) {
      if (hexAddress.length < 1) {
        throw new Error('Empty payload in address')
      }
    
      switch (hexAddress[0] & 0xf0) {
        case 0x10:
          return CONST.TYPE_USER
        case 0x80:
          return CONST.TYPE_CONTRACT
        case 0x00:
          for (const x of hexAddress) {
            if (x !== 0x00) {
              return CONST.TYPE_BUILTIN
            }
          }
          return CONST.TYPE_NULL
        default:
          return CONST.TYPE_UNKNOWN
          // throw new Error('hexAddress should start with 0x0, 0x1 or 0x8')
      }
    }
    
    function encode (hexAddress, netId, verbose = false) {
      if (isHexString(hexAddress)) {
        hexAddress = Buffer.from(hexAddress.slice(2), 'hex')
      }
      if (!(hexAddress instanceof Buffer)) {
        throw new Error('hexAddress should be passed as a Buffer')
      }
      if (hexAddress.length < 20) {
        throw new Error('hexAddress should be at least 20 bytes')
      }
    
      const addressType = getAddressType(hexAddress).toUpperCase()
      const netName = encodeNetId(netId).toUpperCase()
    
      const netName5Bits = Buffer.from(netName).map(byte => byte & 0b11111)
      const payload5Bits = convertBit([VERSION_BYTE, ...hexAddress], 8, 5, true)
    
      const checksumBigInt = polyMod([...netName5Bits, 0, ...payload5Bits, 0, 0, 0, 0, 0, 0, 0, 0])
      const checksumBytes = Buffer.from(checksumBigInt.toString(16).padStart(10, '0'), 'hex')
      const checksum5Bits = convertBit(checksumBytes, 8, 5, true)
    
      const payload = payload5Bits.map(byte => ALPHABET[byte]).join('')
      const checksum = checksum5Bits.map(byte => ALPHABET[byte]).join('')
    
      return verbose
        ? `${netName}:TYPE.${addressType}:${payload}${checksum}`
        : `${netName}:${payload}${checksum}`.toLowerCase()
    }
    
    function decode (address) {
      // don't allow mixed case
      const lowered = address.toLowerCase()
      const uppered = address.toUpperCase()
      if (address !== lowered && address !== uppered) {
        throw new Error('Mixed-case address ' + address)
      }
    
      const [, netName, shouldHaveType, payload, checksum] = address.toUpperCase().match(/^([^:]+):(.+:)?(.{34})(.{8})$/)
    
      const prefix5Bits = Buffer.from(netName).map(byte => byte & 0b11111)
      const payload5Bits = []
      for (const char of payload) {
        payload5Bits.push(ALPHABET_MAP[char])
      }
      const checksum5Bits = []
      for (const char of checksum) {
        checksum5Bits.push(ALPHABET_MAP[char])
      }
    
      const [version, ...addressBytes] = convertBit(payload5Bits, 5, 8)
      if (version !== VERSION_BYTE) {
        throw new Error('Can not recognize version byte')
      }
    
      const hexAddress = Buffer.from(addressBytes)
      const netId = decodeNetId(netName.toLowerCase())
      const type = getAddressType(hexAddress)
    
      if (shouldHaveType && `type.${type}:` !== shouldHaveType.toLowerCase()) {
        throw new Error('Type of address doesn\'t match')
      }
    
      const bigInt = polyMod([...prefix5Bits, 0, ...payload5Bits, ...checksum5Bits])
      if (Number(bigInt)) {
        throw new Error(`Invalid checksum for ${address}`)
      }
    
      return { hexAddress, netId, type }
    }
    
    module.exports = { encode, decode }
    
    }).call(this)}).call(this,require("buffer").Buffer)
    },{"../const":9,"../utils":10,"./base32":7,"buffer":2}],9:[function(require,module,exports){
    
    const TYPE_USER = 'user'
    const TYPE_CONTRACT = 'contract'
    const TYPE_BUILTIN = 'builtin'
    const TYPE_NULL = 'null'
    const TYPE_UNKNOWN = 'unknown'
    
    const PREFIX_CFX = 'cfx'
    const PREFIX_CFXTEST = 'cfxtest'
    const PREFIX_NET = 'net'
    
    const NETID_MAIN = 1029
    const NETID_TEST = 1
    
    const ZERO_ADDRESS_HEX = '0x0000000000000000000000000000000000000000'
    const ADMIN_CONTROL = '0x0888000000000000000000000000000000000000'
    const SPONSOR_CONTROL = '0x0888000000000000000000000000000000000001'
    const STAKING = '0x0888000000000000000000000000000000000002'
    const CONFLUX_CONTEXT = '0x0888000000000000000000000000000000000004'
    const POS_REGISTER = '0x0888000000000000000000000000000000000005'
    const CROSS_SPACE_CALL = '0x0888000000000000000000000000000000000006'
    const PARAMS_CONTROL = '0x0888000000000000000000000000000000000007'
    
    module.exports = {
      TYPE_USER,
      TYPE_CONTRACT,
      TYPE_BUILTIN,
      TYPE_NULL,
      TYPE_UNKNOWN,
      PREFIX_CFX,
      PREFIX_CFXTEST,
      PREFIX_NET,
      NETID_MAIN,
      NETID_TEST,
      ZERO_ADDRESS_HEX,
      ADMIN_CONTROL,
      SPONSOR_CONTROL,
      STAKING,
      CONFLUX_CONTEXT,
      POS_REGISTER,
      CROSS_SPACE_CALL,
      PARAMS_CONTROL
    }
    
    },{}],10:[function(require,module,exports){
    
    exports.isHexString = function (v) {
      return typeof v === 'string' && v.match(/^0x[0-9A-Fa-f]*$/)
    }
    
    exports.isString = function (data) {
      return typeof data === 'string'
    }
    
    },{}]},{},[6])(6)
    });
    