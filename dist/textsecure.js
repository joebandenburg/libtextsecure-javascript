/**
 * Copyright (C) 2015 Joe Bandenburg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'protobufjs',
            'traceur-runtime',
            'axolotl',
            'axolotl-crypto',
            '',
            '',
            '',
            ''
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('protobufjs'), require('traceur/bin/traceur-runtime'), require('axolotl'), require('axolotl-crypto'), require('http'), require('https'), require('url'), require('buffer'));
    } else {
        this.textsecure = factory(dcodeIO.ProtoBuf, 1, axolotl, axolotlCrypto, undefined, undefined, undefined, undefined);
    }
}(function (__external_1, __external_2, __external_axolotl, __external_axolotlCrypto, __external_http, __external_https, __external_url, __external_buffer) {
    var global = this, define;
    function _require(id) {
        var module = _require.cache[id];
        if (!module) {
            var exports = {};
            module = _require.cache[id] = {
                id: id,
                exports: exports
            };
            _require.modules[id].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            module.exports = __external_buffer;
        },
        function (module, exports) {
            'use strict';
            var $__src_47_TextSecure__;
            var TextSecure = ($__src_47_TextSecure__ = _require(13), $__src_47_TextSecure__ && $__src_47_TextSecure__.__esModule && $__src_47_TextSecure__ || { default: $__src_47_TextSecure__ }).default;
            module.exports = function (store, serverEndpointHost, webSocketFactory, options) {
                return new TextSecure(store, serverEndpointHost, webSocketFactory, options);
            };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__co__, $__Base64__;
            var co = ($__co__ = _require(37), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            var encode = ($__Base64__ = _require(4), $__Base64__ && $__Base64__.__esModule && $__Base64__ || { default: $__Base64__ }).encode;
            function AccountCreator(store, axolotl, axolotlCrypto, protocol, preKeyGenerationCount) {
                this.requestVerificationCode = function (number) {
                    return protocol.requestVerificationCode('sms', number);
                };
                this.registerFirstDevice = co.wrap($traceurRuntime.initGeneratorFunction(function $__2(number, verificationCode) {
                    var identityKeyPair, localState, preKeys, lastResortPreKey, signedPreKey, $__3, $__4, $__5, $__6, $__7, $__8, $__9, $__10, $__11, $__12, $__13, $__14;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return axolotl.generateIdentityKeyPair();
                            case 2:
                                identityKeyPair = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__3 = axolotl.generateRegistrationId;
                                $__4 = $__3.call(axolotl);
                                $ctx.state = 22;
                                break;
                            case 22:
                                $ctx.state = 6;
                                return $__4;
                            case 6:
                                $__5 = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $__6 = generatePassword();
                                $ctx.state = 24;
                                break;
                            case 24:
                                $ctx.state = 10;
                                return $__6;
                            case 10:
                                $__7 = $ctx.sent;
                                $ctx.state = 12;
                                break;
                            case 12:
                                $__8 = {
                                    number: number,
                                    device: 1,
                                    password: $__7
                                };
                                $__9 = randomBytes(32);
                                $ctx.state = 26;
                                break;
                            case 26:
                                $ctx.state = 14;
                                return $__9;
                            case 14:
                                $__10 = $ctx.sent;
                                $ctx.state = 16;
                                break;
                            case 16:
                                $__11 = randomBytes(20);
                                $ctx.state = 28;
                                break;
                            case 28:
                                $ctx.state = 18;
                                return $__11;
                            case 18:
                                $__12 = $ctx.sent;
                                $ctx.state = 20;
                                break;
                            case 20:
                                $__13 = {
                                    cipher: $__10,
                                    mac: $__12
                                };
                                $__14 = {
                                    registrationId: $__5,
                                    identityKeyPair: identityKeyPair,
                                    auth: $__8,
                                    signalingKey: $__13
                                };
                                localState = $__14;
                                $ctx.state = 30;
                                break;
                            case 30:
                                $ctx.state = 32;
                                return protocol.createAccount(localState.auth, verificationCode, localState.signalingKey, localState.registrationId);
                            case 32:
                                $ctx.maybeThrow();
                                $ctx.state = 34;
                                break;
                            case 34:
                                $ctx.state = 36;
                                return store.putLocalState(localState);
                            case 36:
                                $ctx.maybeThrow();
                                $ctx.state = 38;
                                break;
                            case 38:
                                $ctx.state = 40;
                                return axolotl.generatePreKeys(0, preKeyGenerationCount);
                            case 40:
                                preKeys = $ctx.sent;
                                $ctx.state = 42;
                                break;
                            case 42:
                                $ctx.state = 44;
                                return axolotl.generateLastResortPreKey();
                            case 44:
                                lastResortPreKey = $ctx.sent;
                                $ctx.state = 46;
                                break;
                            case 46:
                                $ctx.state = 48;
                                return axolotl.generateSignedPreKey(identityKeyPair, 0);
                            case 48:
                                signedPreKey = $ctx.sent;
                                $ctx.state = 50;
                                break;
                            case 50:
                                $ctx.state = 52;
                                return protocol.registerPreKeys(localState.auth, preKeys, lastResortPreKey, signedPreKey, identityKeyPair.public);
                            case 52:
                                $ctx.maybeThrow();
                                $ctx.state = 54;
                                break;
                            case 54:
                                $ctx.state = 56;
                                return preKeys.map(function (preKey) {
                                    return store.putLocalPreKeyPair(preKey.id, preKey.keyPair);
                                });
                            case 56:
                                $ctx.maybeThrow();
                                $ctx.state = 58;
                                break;
                            case 58:
                                $ctx.state = 60;
                                return store.putLocalPreKeyPair(lastResortPreKey.id, lastResortPreKey.keyPair);
                            case 60:
                                $ctx.maybeThrow();
                                $ctx.state = 62;
                                break;
                            case 62:
                                $ctx.state = 64;
                                return store.putLocalSignedPreKeyPair(signedPreKey.id, signedPreKey.keyPair);
                            case 64:
                                $ctx.maybeThrow();
                                $ctx.state = 66;
                                break;
                            case 66:
                                $ctx.returnValue = localState;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__2, this);
                }));
                var randomBytes = function (byteCount) {
                    return Promise.resolve(axolotlCrypto.randomBytes(byteCount));
                };
                var generatePassword = co.wrap($traceurRuntime.initGeneratorFunction(function $__15() {
                        var passwordBytes;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return randomBytes(16);
                                case 2:
                                    passwordBytes = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = encode(passwordBytes, false);
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__15, this);
                    }));
            }
            var $__default = AccountCreator;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__default = {
                    areEqual: function (left, right) {
                        if (left.byteLength !== right.byteLength) {
                            return false;
                        }
                        var leftView = new Uint8Array(left);
                        var rightView = new Uint8Array(right);
                        for (var i = 0; i < left.byteLength; i++) {
                            if (leftView[i] !== rightView[i]) {
                                return false;
                            }
                        }
                        return true;
                    }
                };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                encode: {
                    get: function () {
                        return encode;
                    }
                },
                encodeStr: {
                    get: function () {
                        return encodeStr;
                    }
                },
                decode: {
                    get: function () {
                        return decode;
                    }
                },
                __esModule: { value: true }
            });
            function encode(arrayBuffer) {
                var padding = arguments[1] !== void 0 ? arguments[1] : true;
                return base64EncArr(arrayBuffer, padding);
            }
            function encodeStr(string) {
                return base64EncArr(strToUTF8Arr(string));
            }
            function decode(string) {
                return base64DecToArr(string);
            }
            function b64ToUint6(nChr) {
                return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
            }
            function base64DecToArr(sBase64, nBlocksSize) {
                var sB64Enc = sBase64.replace(/=+$/g, '');
                if (sB64Enc.match(/[^A-Za-z0-9\+\/]/)) {
                    throw new Error('Input string is not a valid base64 string');
                }
                var nInLen = sB64Enc.length;
                var nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
                var taBytes = new Uint8Array(nOutLen);
                var nMod3;
                var nMod4;
                var nUint24 = 0;
                var nOutIdx = 0;
                for (var nInIdx = 0; nInIdx < nInLen; nInIdx++) {
                    nMod4 = nInIdx & 3;
                    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
                    if (nMod4 === 3 || nInLen - nInIdx === 1) {
                        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                            taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                        }
                        nUint24 = 0;
                    }
                }
                return taBytes.buffer;
            }
            function uint6ToB64(nUint6) {
                return nUint6 < 26 ? nUint6 + 65 : nUint6 < 52 ? nUint6 + 71 : nUint6 < 62 ? nUint6 - 4 : nUint6 === 62 ? 43 : nUint6 === 63 ? 47 : 65;
            }
            function base64EncArr(buffer, padding) {
                var nMod3 = 2;
                var sB64Enc = '';
                var aBytes = new Uint8Array(buffer);
                for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
                    nMod3 = nIdx % 3;
                    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
                    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                        sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                        nUint24 = 0;
                    }
                }
                var output = sB64Enc.substr(0, sB64Enc.length - 2 + nMod3);
                if (padding) {
                    output = output + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==');
                }
                return output;
            }
            function UTF8ArrToStr(aBytes) {
                var sView = '';
                for (var nPart = void 0, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
                    nPart = aBytes[nIdx];
                    sView += String.fromCharCode(nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128 : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? (nPart - 192 << 6) + aBytes[++nIdx] - 128 : nPart);
                }
                return sView;
            }
            function strToUTF8Arr(sDOMStr) {
                var aBytes;
                var nChr;
                var nStrLen = sDOMStr.length;
                var nArrLen = 0;
                for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
                    nChr = sDOMStr.charCodeAt(nMapIdx);
                    nArrLen += nChr < 128 ? 1 : nChr < 2048 ? 2 : nChr < 65536 ? 3 : nChr < 2097152 ? 4 : nChr < 67108864 ? 5 : 6;
                }
                aBytes = new Uint8Array(nArrLen);
                for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
                    nChr = sDOMStr.charCodeAt(nChrIdx);
                    if (nChr < 128) {
                        aBytes[nIdx++] = nChr;
                    } else if (nChr < 2048) {
                        aBytes[nIdx++] = 192 + (nChr >>> 6);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 65536) {
                        aBytes[nIdx++] = 224 + (nChr >>> 12);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 2097152) {
                        aBytes[nIdx++] = 240 + (nChr >>> 18);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else if (nChr < 67108864) {
                        aBytes[nIdx++] = 248 + (nChr >>> 24);
                        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    } else {
                        aBytes[nIdx++] = 252 + (nChr >>> 30);
                        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                        aBytes[nIdx++] = 128 + (nChr & 63);
                    }
                }
                return aBytes.buffer;
            }
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var Contact = function Contact(otherContact) {
                Object.assign(this, {
                    identityKey: null,
                    devices: []
                }, otherContact);
                Object.seal(this);
            };
            $traceurRuntime.createClass(Contact, {
                removeDevices: function (deviceIds) {
                    var devicesIdMap = {};
                    deviceIds.forEach(function (id) {
                        return devicesIdMap[id] = 1;
                    });
                    this.devices = this.devices.filter(function (device) {
                        return !devicesIdMap[device.id];
                    });
                },
                getDevice: function (deviceId) {
                    var devices = this.devices.filter(function (device) {
                            return device.id === deviceId;
                        });
                    if (devices.length > 0) {
                        return devices[0];
                    }
                    return null;
                }
            }, {});
            var $__default = Contact;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                NoSuchContactException: {
                    get: function () {
                        return NoSuchContactException;
                    }
                },
                InvalidCredentialsException: {
                    get: function () {
                        return InvalidCredentialsException;
                    }
                },
                MismatchedDevicesException: {
                    get: function () {
                        return MismatchedDevicesException;
                    }
                },
                StaleDevicesException: {
                    get: function () {
                        return StaleDevicesException;
                    }
                },
                BadlyFormattedMessageBodyException: {
                    get: function () {
                        return BadlyFormattedMessageBodyException;
                    }
                },
                IncorrectVerificationCodeException: {
                    get: function () {
                        return IncorrectVerificationCodeException;
                    }
                },
                NumberAlreadyRegisteredException: {
                    get: function () {
                        return NumberAlreadyRegisteredException;
                    }
                },
                __esModule: { value: true }
            });
            var NoSuchContactException = function NoSuchContactException() {
                $traceurRuntime.superConstructor($NoSuchContactException).apply(this, arguments);
            };
            var $NoSuchContactException = NoSuchContactException;
            $traceurRuntime.createClass(NoSuchContactException, {}, {}, Error);
            var InvalidCredentialsException = function InvalidCredentialsException() {
                $traceurRuntime.superConstructor($InvalidCredentialsException).apply(this, arguments);
            };
            var $InvalidCredentialsException = InvalidCredentialsException;
            $traceurRuntime.createClass(InvalidCredentialsException, {}, {}, Error);
            var MismatchedDevicesException = function MismatchedDevicesException(missingDevices, extraDevices) {
                $traceurRuntime.superConstructor($MismatchedDevicesException).call(this);
                this.missingDevices = missingDevices;
                this.extraDevices = extraDevices;
            };
            var $MismatchedDevicesException = MismatchedDevicesException;
            $traceurRuntime.createClass(MismatchedDevicesException, {}, {}, Error);
            var StaleDevicesException = function StaleDevicesException(staleDevices) {
                $traceurRuntime.superConstructor($StaleDevicesException).call(this);
                this.staleDevices = staleDevices;
            };
            var $StaleDevicesException = StaleDevicesException;
            $traceurRuntime.createClass(StaleDevicesException, {}, {}, Error);
            var BadlyFormattedMessageBodyException = function BadlyFormattedMessageBodyException() {
                $traceurRuntime.superConstructor($BadlyFormattedMessageBodyException).apply(this, arguments);
            };
            var $BadlyFormattedMessageBodyException = BadlyFormattedMessageBodyException;
            $traceurRuntime.createClass(BadlyFormattedMessageBodyException, {}, {}, Error);
            var IncorrectVerificationCodeException = function IncorrectVerificationCodeException() {
                $traceurRuntime.superConstructor($IncorrectVerificationCodeException).apply(this, arguments);
            };
            var $IncorrectVerificationCodeException = IncorrectVerificationCodeException;
            $traceurRuntime.createClass(IncorrectVerificationCodeException, {}, {}, Error);
            var NumberAlreadyRegisteredException = function NumberAlreadyRegisteredException() {
                $traceurRuntime.superConstructor($NumberAlreadyRegisteredException).apply(this, arguments);
            };
            var $NumberAlreadyRegisteredException = NumberAlreadyRegisteredException;
            $traceurRuntime.createClass(NumberAlreadyRegisteredException, {}, {}, Error);
        },
        function (module, exports) {
            'use strict';
            module.exports = _require(38).newBuilder({})['import']({
                'package': 'textsecure',
                'messages': [
                    {
                        'name': 'IncomingPushMessageSignal',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'Type',
                                'name': 'type',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'source',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'sourceDevice',
                                'id': 7
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'relay',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint64',
                                'name': 'timestamp',
                                'id': 5
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'message',
                                'id': 6
                            }
                        ],
                        'enums': [{
                                'name': 'Type',
                                'values': [
                                    {
                                        'name': 'UNKNOWN',
                                        'id': 0
                                    },
                                    {
                                        'name': 'CIPHERTEXT',
                                        'id': 1
                                    },
                                    {
                                        'name': 'KEY_EXCHANGE',
                                        'id': 2
                                    },
                                    {
                                        'name': 'PREKEY_BUNDLE',
                                        'id': 3
                                    },
                                    {
                                        'name': 'PLAINTEXT',
                                        'id': 4
                                    },
                                    {
                                        'name': 'RECEIPT',
                                        'id': 5
                                    }
                                ],
                                'options': {}
                            }],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'PushMessageContent',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'body',
                                'id': 1
                            },
                            {
                                'rule': 'repeated',
                                'options': {},
                                'type': 'AttachmentPointer',
                                'name': 'attachments',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'GroupContext',
                                'name': 'group',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'flags',
                                'id': 4
                            }
                        ],
                        'enums': [{
                                'name': 'Flags',
                                'values': [{
                                        'name': 'END_SESSION',
                                        'id': 1
                                    }],
                                'options': {}
                            }],
                        'messages': [
                            {
                                'name': 'AttachmentPointer',
                                'fields': [
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'fixed64',
                                        'name': 'id',
                                        'id': 1
                                    },
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'string',
                                        'name': 'contentType',
                                        'id': 2
                                    },
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'bytes',
                                        'name': 'key',
                                        'id': 3
                                    }
                                ],
                                'enums': [],
                                'messages': [],
                                'options': {},
                                'oneofs': {}
                            },
                            {
                                'name': 'GroupContext',
                                'fields': [
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'bytes',
                                        'name': 'id',
                                        'id': 1
                                    },
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'Type',
                                        'name': 'type',
                                        'id': 2
                                    },
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'string',
                                        'name': 'name',
                                        'id': 3
                                    },
                                    {
                                        'rule': 'repeated',
                                        'options': {},
                                        'type': 'string',
                                        'name': 'members',
                                        'id': 4
                                    },
                                    {
                                        'rule': 'optional',
                                        'options': {},
                                        'type': 'AttachmentPointer',
                                        'name': 'avatar',
                                        'id': 5
                                    }
                                ],
                                'enums': [{
                                        'name': 'Type',
                                        'values': [
                                            {
                                                'name': 'UNKNOWN',
                                                'id': 0
                                            },
                                            {
                                                'name': 'UPDATE',
                                                'id': 1
                                            },
                                            {
                                                'name': 'DELIVER',
                                                'id': 2
                                            },
                                            {
                                                'name': 'QUIT',
                                                'id': 3
                                            }
                                        ],
                                        'options': {}
                                    }],
                                'messages': [],
                                'options': {},
                                'oneofs': {}
                            }
                        ],
                        'options': {},
                        'oneofs': {}
                    }
                ],
                'enums': [],
                'imports': [],
                'options': {},
                'services': []
            }).build('textsecure');
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                padMessage: {
                    get: function () {
                        return padMessage;
                    }
                },
                unpadMessage: {
                    get: function () {
                        return unpadMessage;
                    }
                },
                __esModule: { value: true }
            });
            var padMessage = function (message, blockSize) {
                var byteCountInFinalBlock = message.byteLength % blockSize;
                var remainingByteCountInFinalBlock = blockSize - byteCountInFinalBlock;
                var paddingBytes;
                if (remainingByteCountInFinalBlock === 1) {
                    paddingBytes = blockSize;
                } else if (remainingByteCountInFinalBlock === 0) {
                    paddingBytes = blockSize - 1;
                } else {
                    paddingBytes = remainingByteCountInFinalBlock - 1;
                }
                var paddedMessage = new Uint8Array(message.byteLength + paddingBytes);
                paddedMessage.set(new Uint8Array(message), 0);
                paddedMessage[message.byteLength] = 128;
                return paddedMessage.buffer;
            };
            var unpadMessage = function (paddedMessage) {
                var paddedMessageBytes = new Uint8Array(paddedMessage);
                for (var messageLength = paddedMessage.byteLength - 1; messageLength > 0; messageLength--) {
                    if (paddedMessageBytes[messageLength] === 128) {
                        break;
                    } else if (paddedMessageBytes[messageLength] !== 0) {
                        throw new Error('Malformed padding');
                    }
                }
                var message = new Uint8Array(messageLength);
                message.set(paddedMessageBytes.subarray(0, messageLength), 0);
                return message.buffer;
            };
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__IncomingPushMessageSignalProtos__, $__MessagePadder__, $__Contact__, $__co__;
            var IncomingPushMessageSignalProtos = ($__IncomingPushMessageSignalProtos__ = _require(7), $__IncomingPushMessageSignalProtos__ && $__IncomingPushMessageSignalProtos__.__esModule && $__IncomingPushMessageSignalProtos__ || { default: $__IncomingPushMessageSignalProtos__ }).default;
            var unpadMessage = ($__MessagePadder__ = _require(8), $__MessagePadder__ && $__MessagePadder__.__esModule && $__MessagePadder__ || { default: $__MessagePadder__ }).unpadMessage;
            var Contact = ($__Contact__ = _require(5), $__Contact__ && $__Contact__.__esModule && $__Contact__ || { default: $__Contact__ }).default;
            var co = ($__co__ = _require(37), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            var IncomingPushMessageSignalProto = IncomingPushMessageSignalProtos.IncomingPushMessageSignal;
            var MessageType = IncomingPushMessageSignalProto.Type;
            var PushMessageContentProto = IncomingPushMessageSignalProtos.PushMessageContent;
            function MessageReceiver(store, axolotl, signalingCipher) {
                this.onpushmessagecontent = function () {
                };
                this.onreceipt = function () {
                };
                this.processIncomingMessageSignal = co.wrap($traceurRuntime.initGeneratorFunction(function $__5(encryptedIncomingPushMessageSignalBytes) {
                    var incomingPushMessageSignalBytes, incomingPushMessageSignal, $__4, contact, device, isPreKeyWhisperMessage, decryptionResult, paddedPushMessageContentBytes, pushMessageContentBytes, pushMessageContent, $__6, $__7, $__8, $__9, $__10, $__11;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return signalingCipher.decrypt(encryptedIncomingPushMessageSignalBytes);
                            case 2:
                                incomingPushMessageSignalBytes = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                incomingPushMessageSignal = decodeIncomingPushMessageSignal(incomingPushMessageSignalBytes);
                                $ctx.state = 40;
                                break;
                            case 40:
                                switch (incomingPushMessageSignal.type) {
                                case MessageType.PREKEY_BUNDLE:
                                    $ctx.state = 9;
                                    break;
                                case MessageType.CIPHERTEXT:
                                    $ctx.state = 9;
                                    break;
                                case MessageType.RECEIPT:
                                    $ctx.state = 31;
                                    break;
                                default:
                                    $ctx.state = 35;
                                    break;
                                }
                                break;
                            case 20:
                                processPushMessageContent(incomingPushMessageSignal, pushMessageContent);
                                $ctx.state = -2;
                                break;
                            case 18:
                                $ctx.maybeThrow();
                                $ctx.state = 20;
                                break;
                            case 26:
                                $ctx.state = 18;
                                return store.putContact(incomingPushMessageSignal.source, contact);
                            case 16:
                                device.axolotlSession = decryptionResult.session;
                                if (isPreKeyWhisperMessage) {
                                    device.registrationId = decryptionResult.registrationId;
                                }
                                paddedPushMessageContentBytes = decryptionResult.message;
                                pushMessageContentBytes = unpadMessage(paddedPushMessageContentBytes);
                                pushMessageContent = PushMessageContentProto.decode(pushMessageContentBytes);
                                $ctx.state = 26;
                                break;
                            case 14:
                                decryptionResult = $ctx.sent;
                                $ctx.state = 16;
                                break;
                            case 24:
                                $ctx.state = 14;
                                return decryptPushMessageContent(isPreKeyWhisperMessage, incomingPushMessageSignal.message, device.axolotlSession);
                            case 12:
                                isPreKeyWhisperMessage = incomingPushMessageSignal.type === MessageType.PREKEY_BUNDLE;
                                $ctx.state = 24;
                                break;
                            case 8:
                                $__4 = $__9;
                                $__10 = $__4.contact;
                                contact = $__10;
                                $__11 = $__4.device;
                                device = $__11;
                                $ctx.state = 12;
                                break;
                            case 6:
                                $__9 = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 10:
                                $ctx.state = 6;
                                return $__8;
                            case 9:
                                $__6 = incomingPushMessageSignal.source;
                                $__7 = incomingPushMessageSignal.sourceDevice;
                                $__8 = getContactAndDevice($__6, $__7);
                                $ctx.state = 10;
                                break;
                            case 31:
                                self.onreceipt(incomingPushMessageSignal.source, incomingPushMessageSignal.timestamp);
                                $ctx.state = -2;
                                break;
                            case 35:
                                throw new Error('Unhandled incoming push message signal type ' + incomingPushMessageSignal.type);
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__5, this);
                }));
                var getContactAndDevice = co.wrap($traceurRuntime.initGeneratorFunction(function $__12(number, deviceId) {
                        var hasContact, contact, device;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return store.hasContact(number);
                                case 2:
                                    hasContact = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.state = !hasContact ? 11 : 5;
                                    break;
                                case 11:
                                    contact = new Contact();
                                    $ctx.state = 12;
                                    break;
                                case 5:
                                    $ctx.state = 6;
                                    return store.getContact(number);
                                case 6:
                                    contact = $ctx.sent;
                                    $ctx.state = 8;
                                    break;
                                case 8:
                                    contact = new Contact(contact);
                                    device = contact.getDevice(deviceId);
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    if (!device) {
                                        device = { id: deviceId };
                                        contact.devices.push(device);
                                    }
                                    $ctx.state = 17;
                                    break;
                                case 17:
                                    $ctx.returnValue = {
                                        contact: contact,
                                        device: device
                                    };
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__12, this);
                    }));
                var self = this;
                var decodeIncomingPushMessageSignal = function (incomingPushMessageSignalBytes) {
                    var incomingPushMessageSignal = IncomingPushMessageSignalProto.decode(incomingPushMessageSignalBytes);
                    if (incomingPushMessageSignal.message) {
                        incomingPushMessageSignal.message = incomingPushMessageSignal.message.toArrayBuffer();
                    }
                    if (incomingPushMessageSignal.timestamp) {
                        incomingPushMessageSignal.timestamp = incomingPushMessageSignal.timestamp.toNumber();
                    }
                    return incomingPushMessageSignal;
                };
                var decryptPushMessageContent = co.wrap($traceurRuntime.initGeneratorFunction(function $__13(isPreKeyWhisperMessage, encryptedPushMessageContent, session) {
                        var $__14, $__15, $__16, $__17, $__18, $__19;
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = isPreKeyWhisperMessage ? 5 : 17;
                                    break;
                                case 5:
                                    $__14 = axolotl.decryptPreKeyWhisperMessage;
                                    $__15 = $__14.call(axolotl, session, encryptedPushMessageContent);
                                    $ctx.state = 6;
                                    break;
                                case 6:
                                    $ctx.state = 2;
                                    return $__15;
                                case 2:
                                    $__16 = $ctx.sent;
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    $ctx.returnValue = $__16;
                                    $ctx.state = -2;
                                    break;
                                case 17:
                                    if (!session) {
                                        throw new Error('No pre-existing session');
                                    }
                                    $ctx.state = 18;
                                    break;
                                case 18:
                                    $__17 = axolotl.decryptWhisperMessage;
                                    $__18 = $__17.call(axolotl, session, encryptedPushMessageContent);
                                    $ctx.state = 14;
                                    break;
                                case 14:
                                    $ctx.state = 10;
                                    return $__18;
                                case 10:
                                    $__19 = $ctx.sent;
                                    $ctx.state = 12;
                                    break;
                                case 12:
                                    $ctx.returnValue = $__19;
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__13, this);
                    }));
                var processPushMessageContent = function (incomingPushMessageSignal, pushMessageContent) {
                    self.onpushmessagecontent(incomingPushMessageSignal.source, pushMessageContent.body, incomingPushMessageSignal.timestamp);
                };
            }
            var $__default = MessageReceiver;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__IncomingPushMessageSignalProtos__, $__Protocol__, $__MessagePadder__, $__Exceptions__, $__Contact__, $__axolotl__, $__co__;
            var IncomingPushMessageSignalProtos = ($__IncomingPushMessageSignalProtos__ = _require(7), $__IncomingPushMessageSignalProtos__ && $__IncomingPushMessageSignalProtos__.__esModule && $__IncomingPushMessageSignalProtos__ || { default: $__IncomingPushMessageSignalProtos__ }).default;
            var Protocol = ($__Protocol__ = _require(11), $__Protocol__ && $__Protocol__.__esModule && $__Protocol__ || { default: $__Protocol__ }).default;
            var padMessage = ($__MessagePadder__ = _require(8), $__MessagePadder__ && $__MessagePadder__.__esModule && $__MessagePadder__ || { default: $__MessagePadder__ }).padMessage;
            var $__3 = ($__Exceptions__ = _require(6), $__Exceptions__ && $__Exceptions__.__esModule && $__Exceptions__ || { default: $__Exceptions__ }), MismatchedDevicesException = $__3.MismatchedDevicesException, StaleDevicesException = $__3.StaleDevicesException;
            var Contact = ($__Contact__ = _require(5), $__Contact__ && $__Contact__.__esModule && $__Contact__ || { default: $__Contact__ }).default;
            var Axolotl = ($__axolotl__ = _require(36), $__axolotl__ && $__axolotl__.__esModule && $__axolotl__ || { default: $__axolotl__ }).default;
            var co = ($__co__ = _require(37), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            var IncomingPushMessageSignalProto = IncomingPushMessageSignalProtos.IncomingPushMessageSignal;
            var PushMessageContentProto = IncomingPushMessageSignalProtos.PushMessageContent;
            var paddingBlockSize = 160;
            var sendMessageRetryAttemptLimit = 5;
            function MessageSender(store, axolotl, protocol) {
                this.sendMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__8(toNumber, messageText, timestamp, attachments) {
                    var paddedPushMessageContentBytes, hasContact, preKeys, newContact, contact, sendMessageToContact, attemptToSendMessageToContact, $__27, $__28, $__29, $__30;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                paddedPushMessageContentBytes = constructMessageContent(messageText, attachments);
                                $ctx.state = 37;
                                break;
                            case 37:
                                $ctx.state = 2;
                                return store.hasContact(toNumber);
                            case 2:
                                hasContact = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = !hasContact ? 5 : 16;
                                break;
                            case 5:
                                $ctx.state = 6;
                                return protocol.getPreKeys(toNumber);
                            case 6:
                                preKeys = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                newContact = new Contact({
                                    identityKey: preKeys.identityKey,
                                    devices: []
                                });
                                $ctx.state = 18;
                                break;
                            case 18:
                                $ctx.state = 10;
                                return addDevices(newContact, preKeys);
                            case 10:
                                $ctx.maybeThrow();
                                $ctx.state = 12;
                                break;
                            case 12:
                                $ctx.state = 14;
                                return store.putContact(toNumber, newContact);
                            case 14:
                                $ctx.maybeThrow();
                                $ctx.state = 16;
                                break;
                            case 16:
                                $__27 = store.getContact;
                                $__28 = $__27.call(store, toNumber);
                                $ctx.state = 25;
                                break;
                            case 25:
                                $ctx.state = 21;
                                return $__28;
                            case 21:
                                $__29 = $ctx.sent;
                                $ctx.state = 23;
                                break;
                            case 23:
                                $__30 = new Contact($__29);
                                contact = $__30;
                                $ctx.state = 27;
                                break;
                            case 27:
                                sendMessageToContact = co.wrap($traceurRuntime.initGeneratorFunction(function $__9() {
                                    var messages;
                                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                        while (true)
                                            switch ($ctx.state) {
                                            case 0:
                                                $ctx.state = 2;
                                                return contact.devices.map(co.wrap($traceurRuntime.initGeneratorFunction(function $__10(device) {
                                                    var $__7, isPreKeyWhisperMessage, encryptedPushMessageContentBytes, newAxolotlSession, type, $__11, $__12, $__13, $__14, $__15, $__16, $__17;
                                                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                                        while (true)
                                                            switch ($ctx.state) {
                                                            case 0:
                                                                $__11 = axolotl.encryptMessage;
                                                                $__12 = device.axolotlSession;
                                                                $__13 = $__11.call(axolotl, $__12, paddedPushMessageContentBytes);
                                                                $ctx.state = 6;
                                                                break;
                                                            case 6:
                                                                $ctx.state = 2;
                                                                return $__13;
                                                            case 2:
                                                                $__14 = $ctx.sent;
                                                                $ctx.state = 4;
                                                                break;
                                                            case 4:
                                                                $__7 = $__14;
                                                                $__15 = $__7.isPreKeyWhisperMessage;
                                                                isPreKeyWhisperMessage = $__15;
                                                                $__16 = $__7.body;
                                                                encryptedPushMessageContentBytes = $__16;
                                                                $__17 = $__7.session;
                                                                newAxolotlSession = $__17;
                                                                $ctx.state = 8;
                                                                break;
                                                            case 8:
                                                                device.axolotlSession = newAxolotlSession;
                                                                type = isPreKeyWhisperMessage ? IncomingPushMessageSignalProto.Type.PREKEY_BUNDLE : IncomingPushMessageSignalProto.Type.CIPHERTEXT;
                                                                $ctx.state = 12;
                                                                break;
                                                            case 12:
                                                                $ctx.returnValue = {
                                                                    type: type,
                                                                    destinationDeviceId: device.id,
                                                                    destinationRegistrationId: device.registrationId,
                                                                    body: encryptedPushMessageContentBytes,
                                                                    timestamp: timestamp
                                                                };
                                                                $ctx.state = -2;
                                                                break;
                                                            default:
                                                                return $ctx.end();
                                                            }
                                                    }, $__10, this);
                                                })));
                                            case 2:
                                                messages = $ctx.sent;
                                                $ctx.state = 4;
                                                break;
                                            case 4:
                                                $ctx.state = 6;
                                                return protocol.submitMessage(toNumber, messages);
                                            case 6:
                                                $ctx.maybeThrow();
                                                $ctx.state = -2;
                                                break;
                                            default:
                                                return $ctx.end();
                                            }
                                    }, $__9, this);
                                }));
                                attemptToSendMessageToContact = co.wrap($traceurRuntime.initGeneratorFunction(function $__10(retriesRemaining) {
                                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                        while (true)
                                            switch ($ctx.state) {
                                            case 0:
                                                if (retriesRemaining === 0) {
                                                    throw new Error('Giving up after ' + sendMessageRetryAttemptLimit + ' attempts to send message');
                                                }
                                                $ctx.state = 6;
                                                break;
                                            case 6:
                                                $ctx.state = 2;
                                                return sendMessageToContact().catch(co.wrap($traceurRuntime.initGeneratorFunction(function $__18(response) {
                                                    var $__20, $__21, $__22, $__23, $__24, $__25, $__26;
                                                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                                        while (true)
                                                            switch ($ctx.state) {
                                                            case 0:
                                                                $ctx.state = response instanceof MismatchedDevicesException ? 13 : 25;
                                                                break;
                                                            case 13:
                                                                contact.removeDevices(response.extraDevices);
                                                                $ctx.state = 14;
                                                                break;
                                                            case 14:
                                                                $ctx.state = 2;
                                                                return response.missingDevices.map(co.wrap($traceurRuntime.initGeneratorFunction(function $__19(id) {
                                                                    var preKeys;
                                                                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                                                        while (true)
                                                                            switch ($ctx.state) {
                                                                            case 0:
                                                                                $ctx.state = 2;
                                                                                return protocol.getPreKeys(toNumber, id);
                                                                            case 2:
                                                                                preKeys = $ctx.sent;
                                                                                $ctx.state = 4;
                                                                                break;
                                                                            case 4:
                                                                                $ctx.state = 6;
                                                                                return addDevices(contact, preKeys);
                                                                            case 6:
                                                                                $ctx.maybeThrow();
                                                                                $ctx.state = -2;
                                                                                break;
                                                                            default:
                                                                                return $ctx.end();
                                                                            }
                                                                    }, $__19, this);
                                                                })));
                                                            case 2:
                                                                $ctx.maybeThrow();
                                                                $ctx.state = 4;
                                                                break;
                                                            case 4:
                                                                $__20 = attemptToSendMessageToContact(retriesRemaining - 1);
                                                                $ctx.state = 10;
                                                                break;
                                                            case 10:
                                                                $ctx.state = 6;
                                                                return $__20;
                                                            case 6:
                                                                $__21 = $ctx.sent;
                                                                $ctx.state = 8;
                                                                break;
                                                            case 8:
                                                                $ctx.returnValue = $__21;
                                                                $ctx.state = -2;
                                                                break;
                                                            case 25:
                                                                $ctx.state = response instanceof StaleDevicesException ? 23 : 12;
                                                                break;
                                                            case 23:
                                                                contact.removeDevices(response.staleDevices);
                                                                $ctx.state = 24;
                                                                break;
                                                            case 24:
                                                                $__22 = attemptToSendMessageToContact(retriesRemaining - 1);
                                                                $ctx.state = 20;
                                                                break;
                                                            case 20:
                                                                $ctx.state = 16;
                                                                return $__22;
                                                            case 16:
                                                                $__23 = $ctx.sent;
                                                                $ctx.state = 18;
                                                                break;
                                                            case 18:
                                                                $ctx.returnValue = $__23;
                                                                $ctx.state = -2;
                                                                break;
                                                            case 12:
                                                                $__24 = Promise.reject;
                                                                $__25 = $__24.call(Promise, response);
                                                                $ctx.state = 32;
                                                                break;
                                                            case 32:
                                                                $ctx.state = 28;
                                                                return $__25;
                                                            case 28:
                                                                $__26 = $ctx.sent;
                                                                $ctx.state = 30;
                                                                break;
                                                            case 30:
                                                                $ctx.returnValue = $__26;
                                                                $ctx.state = -2;
                                                                break;
                                                            default:
                                                                return $ctx.end();
                                                            }
                                                    }, $__18, this);
                                                })));
                                            case 2:
                                                $ctx.maybeThrow();
                                                $ctx.state = -2;
                                                break;
                                            default:
                                                return $ctx.end();
                                            }
                                    }, $__10, this);
                                }));
                                $ctx.state = 39;
                                break;
                            case 39:
                                $ctx.state = 29;
                                return attemptToSendMessageToContact(sendMessageRetryAttemptLimit);
                            case 29:
                                $ctx.maybeThrow();
                                $ctx.state = 31;
                                break;
                            case 31:
                                $ctx.state = 33;
                                return store.putContact(toNumber, contact);
                            case 33:
                                $ctx.maybeThrow();
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__8, this);
                }));
                var addDevices = co.wrap($traceurRuntime.initGeneratorFunction(function $__9(contact, preKeys) {
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return preKeys.devices.map(co.wrap($traceurRuntime.initGeneratorFunction(function $__10(preKeyDevice) {
                                        var device, $__31, $__32, $__33, $__34, $__35, $__36, $__37, $__38, $__39, $__40, $__41, $__42, $__43, $__44, $__45, $__46, $__47, $__48, $__49, $__50, $__51, $__52, $__53, $__54, $__55;
                                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                                            while (true)
                                                switch ($ctx.state) {
                                                case 0:
                                                    $__31 = preKeyDevice.deviceId;
                                                    $__32 = preKeyDevice.registrationId;
                                                    $__33 = preKeyDevice.signedPreKey;
                                                    $__34 = $__33.keyId;
                                                    $__35 = preKeyDevice.signedPreKey;
                                                    $__36 = $__35.publicKey;
                                                    $__37 = preKeyDevice.signedPreKey;
                                                    $__38 = $__37.signature;
                                                    $__39 = {
                                                        id: $__34,
                                                        publicKey: $__36,
                                                        signature: $__38
                                                    };
                                                    $__40 = axolotl.createSessionFromPreKeyBundle;
                                                    $__41 = preKeys.identityKey;
                                                    $__42 = preKeyDevice.preKey;
                                                    $__43 = $__42.keyId;
                                                    $__44 = preKeyDevice.preKey;
                                                    $__45 = $__44.publicKey;
                                                    $__46 = preKeyDevice.signedPreKey;
                                                    $__47 = $__46.keyId;
                                                    $__48 = preKeyDevice.signedPreKey;
                                                    $__49 = $__48.publicKey;
                                                    $__50 = preKeyDevice.signedPreKey;
                                                    $__51 = $__50.signature;
                                                    $__52 = {
                                                        identityKey: $__41,
                                                        preKeyId: $__43,
                                                        preKey: $__45,
                                                        signedPreKeyId: $__47,
                                                        signedPreKey: $__49,
                                                        signedPreKeySignature: $__51
                                                    };
                                                    $__53 = $__40.call(axolotl, $__52);
                                                    $ctx.state = 6;
                                                    break;
                                                case 6:
                                                    $ctx.state = 2;
                                                    return $__53;
                                                case 2:
                                                    $__54 = $ctx.sent;
                                                    $ctx.state = 4;
                                                    break;
                                                case 4:
                                                    $__55 = {
                                                        id: $__31,
                                                        registrationId: $__32,
                                                        signedPreKey: $__39,
                                                        axolotlSession: $__54
                                                    };
                                                    device = $__55;
                                                    $ctx.state = 8;
                                                    break;
                                                case 8:
                                                    contact.devices.push(device);
                                                    $ctx.state = -2;
                                                    break;
                                                default:
                                                    return $ctx.end();
                                                }
                                        }, $__10, this);
                                    })));
                                case 2:
                                    $ctx.maybeThrow();
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__9, this);
                    }));
                var constructMessageContent = function (messageText, attachments) {
                    var pushMessageContent = { body: messageText };
                    var pushMessageContentBytes = new PushMessageContentProto(pushMessageContent).encode().toArrayBuffer();
                    return padMessage(pushMessageContentBytes, paddingBlockSize);
                };
            }
            var $__default = MessageSender;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__Exceptions__, $__Base64__;
            var $__0 = ($__Exceptions__ = _require(6), $__Exceptions__ && $__Exceptions__.__esModule && $__Exceptions__ || { default: $__Exceptions__ }), NoSuchContactException = $__0.NoSuchContactException, InvalidCredentialsException = $__0.InvalidCredentialsException, MismatchedDevicesException = $__0.MismatchedDevicesException, StaleDevicesException = $__0.StaleDevicesException, BadlyFormattedMessageBodyException = $__0.BadlyFormattedMessageBodyException, IncorrectVerificationCodeException = $__0.IncorrectVerificationCodeException, NumberAlreadyRegisteredException = $__0.NumberAlreadyRegisteredException;
            var $__1 = ($__Base64__ = _require(4), $__Base64__ && $__Base64__.__esModule && $__Base64__ || { default: $__Base64__ }), encode = $__1.encode, encodeStr = $__1.encodeStr, decode = $__1.decode;
            var maxRetries = 5;
            var RetryableException = function RetryableException(otherException) {
                this.otherException = otherException;
            };
            $traceurRuntime.createClass(RetryableException, {}, {}, Error);
            function Protocol(endpoint, http) {
                this.getPreKeys = function (auth, number, device) {
                    device = device || '*';
                    return request({
                        url: '/v2/keys/' + number + '/' + device,
                        method: 'get',
                        auth: auth
                    }, {
                        404: function () {
                            throw new NoSuchContactException();
                        }
                    }).then(function (response) {
                        var preKeyResponse = response.data;
                        preKeyResponse.identityKey = decode(preKeyResponse.identityKey);
                        preKeyResponse.devices = preKeyResponse.devices.map(function (device) {
                            return {
                                deviceId: parseInt(device.deviceId, 10),
                                registrationId: parseInt(device.registrationId, 10),
                                signedPreKey: {
                                    keyId: device.signedPreKey.keyId,
                                    publicKey: decode(device.signedPreKey.publicKey),
                                    signature: decode(device.signedPreKey.signature)
                                },
                                preKey: {
                                    keyId: device.preKey.keyId,
                                    publicKey: decode(device.preKey.publicKey)
                                }
                            };
                        });
                        return preKeyResponse;
                    });
                };
                this.submitMessage = function (auth, number, messages) {
                    return request({
                        url: '/v1/messages/' + number,
                        auth: auth,
                        method: 'put',
                        data: {
                            messages: messages.map(function (message) {
                                message.body = encode(message.body, true);
                                return message;
                            })
                        }
                    }, {
                        409: function (response) {
                            throw new MismatchedDevicesException(response.data.missingDevices, response.data.extraDevices);
                        },
                        410: function (response) {
                            throw new StaleDevicesException(response.data.staleDevices);
                        }
                    });
                };
                this.requestVerificationCode = function (transport, number) {
                    return request({
                        url: '/v1/accounts/' + transport + '/code/' + number,
                        method: 'get'
                    });
                };
                this.createAccount = function (auth, verificationCode, signalingKey, registrationId) {
                    var concatSignalingKey = new Uint8Array(52);
                    concatSignalingKey.set(new Uint8Array(signalingKey.cipher), 0);
                    concatSignalingKey.set(new Uint8Array(signalingKey.mac), 32);
                    var signalingKeyString = encode(concatSignalingKey.buffer);
                    return request({
                        url: '/v1/accounts/code/' + verificationCode,
                        auth: {
                            number: auth.number,
                            password: auth.password
                        },
                        method: 'put',
                        data: {
                            signalingKey: signalingKeyString,
                            supportsSms: false,
                            fetchesMessages: true,
                            registrationId: registrationId
                        }
                    }, {
                        403: function () {
                            throw new IncorrectVerificationCodeException();
                        },
                        417: function () {
                            throw new NumberAlreadyRegisteredException();
                        }
                    });
                };
                this.registerPreKeys = function (auth, preKeys, lastResortPreKey, signedPreKey, identityPublicKey) {
                    return request({
                        url: '/v2/keys',
                        auth: auth,
                        method: 'put',
                        data: {
                            preKeys: preKeys.map(function (preKey) {
                                return {
                                    keyId: preKey.id,
                                    publicKey: encode(preKey.keyPair.public, false)
                                };
                            }),
                            lastResortKey: {
                                keyId: lastResortPreKey.id,
                                publicKey: encode(lastResortPreKey.keyPair.public, false)
                            },
                            signedPreKey: {
                                keyId: signedPreKey.id,
                                publicKey: encode(signedPreKey.keyPair.public, false),
                                signature: encode(signedPreKey.signature, false)
                            },
                            identityKey: encode(identityPublicKey, false)
                        }
                    });
                };
                var request = function (request, responseHandlers) {
                    if (request.auth) {
                        request.headers = request.headers || {};
                        request.headers.Authorization = constructAuthToken(request.auth);
                        delete request.auth;
                    }
                    request.url = endpoint + request.url;
                    responseHandlers = responseHandlers || {};
                    responseHandlers[401] = function () {
                        throw new InvalidCredentialsException();
                    };
                    responseHandlers[415] = function () {
                        throw new BadlyFormattedMessageBodyException();
                    };
                    return withRetries(function () {
                        return http(request).catch(function (response) {
                            if (!(response instanceof Error)) {
                                if (responseHandlers[response.status] !== undefined) {
                                    return responseHandlers[response.status](response);
                                }
                            }
                            throw new RetryableException(response);
                        });
                    });
                };
                var constructAuthToken = function (auth) {
                    var authString = auth.number;
                    if (auth.device !== undefined) {
                        authString += '.' + auth.device;
                    }
                    authString += ':' + auth.password;
                    return 'Basic ' + encodeStr(authString);
                };
                var withRetries = function (requester) {
                    var retry = function (requester, retriesLeft) {
                        return requester().catch(function (response) {
                            if (response instanceof RetryableException) {
                                if (retriesLeft > 1) {
                                    return retry(requester, retriesLeft - 1);
                                } else {
                                    return Promise.reject(response.otherException);
                                }
                            }
                            return Promise.reject(response);
                        });
                    };
                    return retry(requester, maxRetries);
                };
            }
            var $__default = Protocol;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__ArrayBufferUtils__, $__co__;
            var ArrayBufferUtils = ($__ArrayBufferUtils__ = _require(3), $__ArrayBufferUtils__ && $__ArrayBufferUtils__.__esModule && $__ArrayBufferUtils__ || { default: $__ArrayBufferUtils__ }).default;
            var co = ($__co__ = _require(37), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function SignalingCipher(signalingCipherKey, signalingMacKey, crypto) {
                this.decrypt = co.wrap($traceurRuntime.initGeneratorFunction(function $__2(encryptedIncomingPushMessageSignalBytes) {
                    var versionByte, ivBytes, encryptedBytes, macBytes, incomingPushMessageSignalBytes, bytesToMac, expectedMacBytes;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                if (encryptedIncomingPushMessageSignalBytes.byteLength <= 1 + 16 + 10) {
                                    throw new Error('Malformed incoming push message signal');
                                }
                                versionByte = new Uint8Array(encryptedIncomingPushMessageSignalBytes)[0];
                                if (versionByte !== 1) {
                                    throw new Error('Unsupported incoming push message signal version');
                                }
                                ivBytes = encryptedIncomingPushMessageSignalBytes.slice(1, 17);
                                encryptedBytes = encryptedIncomingPushMessageSignalBytes.slice(17, -10);
                                macBytes = encryptedIncomingPushMessageSignalBytes.slice(-10);
                                $ctx.state = 12;
                                break;
                            case 12:
                                $ctx.state = 2;
                                return Promise.resolve(crypto.decrypt(signalingCipherKey, encryptedBytes, ivBytes));
                            case 2:
                                incomingPushMessageSignalBytes = $ctx.sent;
                                $ctx.state = 4;
                                break;
                            case 4:
                                bytesToMac = encryptedIncomingPushMessageSignalBytes.slice(0, -10);
                                $ctx.state = 14;
                                break;
                            case 14:
                                $ctx.state = 6;
                                return Promise.resolve(crypto.hmac(signalingMacKey, bytesToMac));
                            case 6:
                                expectedMacBytes = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                if (!ArrayBufferUtils.areEqual(macBytes, expectedMacBytes.slice(0, 10))) {
                                    throw new Error('Invalid mac on incoming push message signal');
                                }
                                $ctx.state = 16;
                                break;
                            case 16:
                                $ctx.returnValue = incomingPushMessageSignalBytes;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__2, this);
                }));
            }
            var $__default = SignalingCipher;
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__AccountCreator__, $__MessageSender__, $__MessageReceiver__, $__Protocol__, $__SignalingCipher__, $__WebSocketPushTransport__, $__axolotl__, $__axolotl_45_crypto__, $__axios__, $__co__;
            var AccountCreator = ($__AccountCreator__ = _require(2), $__AccountCreator__ && $__AccountCreator__.__esModule && $__AccountCreator__ || { default: $__AccountCreator__ }).default;
            var MessageSender = ($__MessageSender__ = _require(10), $__MessageSender__ && $__MessageSender__.__esModule && $__MessageSender__ || { default: $__MessageSender__ }).default;
            var MessageReceiver = ($__MessageReceiver__ = _require(9), $__MessageReceiver__ && $__MessageReceiver__.__esModule && $__MessageReceiver__ || { default: $__MessageReceiver__ }).default;
            var Protocol = ($__Protocol__ = _require(11), $__Protocol__ && $__Protocol__.__esModule && $__Protocol__ || { default: $__Protocol__ }).default;
            var SignalingCipher = ($__SignalingCipher__ = _require(12), $__SignalingCipher__ && $__SignalingCipher__.__esModule && $__SignalingCipher__ || { default: $__SignalingCipher__ }).default;
            var WebSocketPushTransport = ($__WebSocketPushTransport__ = _require(15), $__WebSocketPushTransport__ && $__WebSocketPushTransport__.__esModule && $__WebSocketPushTransport__ || { default: $__WebSocketPushTransport__ }).default;
            var axolotl = ($__axolotl__ = _require(36), $__axolotl__ && $__axolotl__.__esModule && $__axolotl__ || { default: $__axolotl__ }).default;
            var axolotlCrypto = ($__axolotl_45_crypto__ = _require(35), $__axolotl_45_crypto__ && $__axolotl_45_crypto__.__esModule && $__axolotl_45_crypto__ || { default: $__axolotl_45_crypto__ }).default;
            var axios = ($__axios__ = _require(18), $__axios__ && $__axios__.__esModule && $__axios__ || { default: $__axios__ }).default;
            var co = ($__co__ = _require(37), $__co__ && $__co__.__esModule && $__co__ || { default: $__co__ }).default;
            function TextSecure(store, serverEndpointHost, webSocketFactory, options) {
                this.onmessage = function () {
                };
                this.onreceipt = function () {
                };
                this.sendMessage = co.wrap($traceurRuntime.initGeneratorFunction(function $__10(number, message, timestamp, attachments) {
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return checkIsRegistered();
                            case 2:
                                $ctx.maybeThrow();
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return messageSender.sendMessage(number, message, timestamp, attachments);
                            case 6:
                                $ctx.maybeThrow();
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__10, this);
                }));
                this.requestVerificationCode = co.wrap($traceurRuntime.initGeneratorFunction(function $__11(number) {
                    var $__12, $__13, $__14;
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return checkIsUnregistered();
                            case 2:
                                $ctx.maybeThrow();
                                $ctx.state = 4;
                                break;
                            case 4:
                                $__12 = accountCreator.requestVerificationCode;
                                $__13 = $__12.call(accountCreator, number);
                                $ctx.state = 10;
                                break;
                            case 10:
                                $ctx.state = 6;
                                return $__13;
                            case 6:
                                $__14 = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                $ctx.returnValue = $__14;
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__11, this);
                }));
                this.registerFirstDevice = co.wrap($traceurRuntime.initGeneratorFunction(function $__15(number, verificationCode) {
                    return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                        while (true)
                            switch ($ctx.state) {
                            case 0:
                                $ctx.state = 2;
                                return checkIsUnregistered();
                            case 2:
                                $ctx.maybeThrow();
                                $ctx.state = 4;
                                break;
                            case 4:
                                $ctx.state = 6;
                                return accountCreator.registerFirstDevice(number, verificationCode);
                            case 6:
                                localState = $ctx.sent;
                                $ctx.state = 8;
                                break;
                            case 8:
                                initialisePostRegistration();
                                $ctx.state = -2;
                                break;
                            default:
                                return $ctx.end();
                            }
                    }, $__15, this);
                }));
                options = Object.assign({}, {
                    httpUseTls: true,
                    webSocketUseTls: true,
                    initialPreKeyGenerationCount: 100
                }, options);
                var axol = axolotl({
                        getLocalIdentityKeyPair: function () {
                            return localState.identityKeyPair;
                        },
                        getLocalRegistrationId: function () {
                            return localState.registrationId;
                        },
                        getLocalSignedPreKeyPair: store.getLocalSignedPreKeyPair.bind(store),
                        getLocalPreKeyPair: store.getLocalPreKeyPair.bind(store)
                    });
                var httpEndpoint = (options.httpUseTls ? 'https' : 'http') + '://' + serverEndpointHost;
                var protocol = new Protocol(httpEndpoint, axios);
                var accountCreator = new AccountCreator(store, axol, axolotlCrypto, protocol, options.initialPreKeyGenerationCount);
                var localState = null;
                var setupPromise = store.getLocalState().then(function (state) {
                        if (state) {
                            localState = state;
                            initialisePostRegistration();
                        }
                    });
                var authenticatedProtocol;
                var messageSender;
                var self = this;
                var initialisePostRegistration = function () {
                    authenticatedProtocol = {
                        getPreKeys: function (number, device) {
                            return protocol.getPreKeys(localState.auth, number, device);
                        },
                        submitMessage: function (number, messages) {
                            return protocol.submitMessage(localState.auth, number, messages);
                        }
                    };
                    messageSender = new MessageSender(store, axol, authenticatedProtocol);
                    var signalingCipher = new SignalingCipher(localState.signalingKey.cipher, localState.signalingKey.mac, axolotlCrypto);
                    var messageReceiver = new MessageReceiver(store, axol, signalingCipher);
                    messageReceiver.onpushmessagecontent = function () {
                        self.onmessage.apply(self, arguments);
                    };
                    messageReceiver.onreceipt = function () {
                        self.onreceipt.apply(self, arguments);
                    };
                    var wsEndpoint = (options.webSocketUseTls ? 'wss' : 'ws') + '://' + serverEndpointHost;
                    var wsUrl = wsEndpoint + '/v1/websocket/?login=' + encodeURIComponent(localState.auth.number) + '.' + encodeURIComponent(localState.auth.device) + '&password=' + encodeURIComponent(localState.auth.password);
                    var webSocket = webSocketFactory.connect(wsUrl);
                    var transport = new WebSocketPushTransport(webSocket);
                    transport.onmessage = messageReceiver.processIncomingMessageSignal;
                };
                var registered = function () {
                    return !!localState;
                };
                var checkIsRegistered = co.wrap($traceurRuntime.initGeneratorFunction(function $__16() {
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return setupPromise;
                                case 2:
                                    $ctx.maybeThrow();
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    if (!registered()) {
                                        throw new Error('This operation can only be done when the client is registered');
                                    }
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__16, this);
                    }));
                var checkIsUnregistered = co.wrap($traceurRuntime.initGeneratorFunction(function $__17() {
                        return $traceurRuntime.createGeneratorInstance(function ($ctx) {
                            while (true)
                                switch ($ctx.state) {
                                case 0:
                                    $ctx.state = 2;
                                    return setupPromise;
                                case 2:
                                    $ctx.maybeThrow();
                                    $ctx.state = 4;
                                    break;
                                case 4:
                                    if (registered()) {
                                        throw new Error('This operation can only be done when the client is not registered');
                                    }
                                    $ctx.state = -2;
                                    break;
                                default:
                                    return $ctx.end();
                                }
                        }, $__17, this);
                    }));
            }
            var $__default = TextSecure;
        },
        function (module, exports) {
            'use strict';
            module.exports = _require(38).newBuilder({})['import']({
                'package': 'textsecure',
                'messages': [
                    {
                        'name': 'WebSocketRequestMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'verb',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'path',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'body',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint64',
                                'name': 'id',
                                'id': 4
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'WebSocketResponseMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint64',
                                'name': 'id',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'uint32',
                                'name': 'status',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'string',
                                'name': 'message',
                                'id': 3
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'bytes',
                                'name': 'body',
                                'id': 4
                            }
                        ],
                        'enums': [],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    },
                    {
                        'name': 'WebSocketMessage',
                        'fields': [
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'Type',
                                'name': 'type',
                                'id': 1
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'WebSocketRequestMessage',
                                'name': 'request',
                                'id': 2
                            },
                            {
                                'rule': 'optional',
                                'options': {},
                                'type': 'WebSocketResponseMessage',
                                'name': 'response',
                                'id': 3
                            }
                        ],
                        'enums': [{
                                'name': 'Type',
                                'values': [
                                    {
                                        'name': 'UNKNOWN',
                                        'id': 0
                                    },
                                    {
                                        'name': 'REQUEST',
                                        'id': 1
                                    },
                                    {
                                        'name': 'RESPONSE',
                                        'id': 2
                                    }
                                ],
                                'options': {}
                            }],
                        'messages': [],
                        'options': {},
                        'oneofs': {}
                    }
                ],
                'enums': [],
                'imports': [],
                'options': {},
                'services': []
            }).build('textsecure');
        },
        function (module, exports) {
            'use strict';
            Object.defineProperties(module.exports, {
                default: {
                    get: function () {
                        return $__default;
                    }
                },
                __esModule: { value: true }
            });
            var $__WebSocketProtocolProtos__;
            var WebSocketProtocolProtos = ($__WebSocketProtocolProtos__ = _require(14), $__WebSocketProtocolProtos__ && $__WebSocketProtocolProtos__.__esModule && $__WebSocketProtocolProtos__ || { default: $__WebSocketProtocolProtos__ }).default;
            var WebSocketMessage = WebSocketProtocolProtos.WebSocketMessage;
            var keepAliveIntervalMilliseconds = 15000;
            function WebSocketPushTransport(webSocket) {
                var self = this;
                this.onmessage = function () {
                };
                webSocket.onmessage = function (webSocketMessageBytes) {
                    var webSocketMessage = WebSocketMessage.decode(webSocketMessageBytes);
                    if (webSocketMessage.type === WebSocketMessage.Type.RESPONSE) {
                        return Promise.resolve();
                    } else {
                        var request = webSocketMessage.request;
                        request.body = request.body.toArrayBuffer();
                        return handleRequest(request).then(function () {
                            sendResponse(request.id, 200, 'OK');
                        }, function () {
                            sendResponse(request.id, 500, '');
                        });
                    }
                };
                var handleRequest = function (request) {
                    var requestHandler = requestHandlers[request.verb + ':' + request.path];
                    if (!requestHandler) {
                        return Promise.reject(new Error('Unhandled request', request));
                    }
                    return Promise.resolve(requestHandler(request.id, request.body));
                };
                var sendResponse = function (id, status, message) {
                    var data = new WebSocketMessage({
                            type: WebSocketMessage.Type.RESPONSE,
                            response: {
                                id: id,
                                status: status,
                                message: message
                            }
                        }).encode().toArrayBuffer();
                    webSocket.send(data);
                };
                var requestHandlers = {
                        'PUT:/api/v1/message': function (id, body) {
                            return self.onmessage(body);
                        }
                    };
                setInterval(function () {
                    var message = new WebSocketMessage({
                            type: WebSocketMessage.Type.REQUEST,
                            request: {
                                verb: 'GET',
                                path: '/v1/keepalive'
                            }
                        }).encode().toArrayBuffer();
                    webSocket.send(message);
                }, keepAliveIntervalMilliseconds);
            }
            var $__default = WebSocketPushTransport;
        },
        function (module, exports) {
            module.exports = __external_http;
        },
        function (module, exports) {
            module.exports = __external_https;
        },
        function (module, exports) {
            module.exports = _require(21);
        },
        function (module, exports) {
            var defaults = _require(24);
            var utils = _require(32);
            var buildUrl = _require(25);
            var transformData = _require(30);
            var http = _require(16);
            var https = _require(17);
            var url = _require(39);
            var pkg = _require(34);
            var Buffer = _require(0).Buffer;
            module.exports = function httpAdapter(resolve, reject, config) {
                var data = transformData(config.data, config.headers, config.transformRequest);
                var headers = utils.merge(defaults.headers.common, defaults.headers[config.method] || {}, config.headers || {});
                headers['User-Agent'] = 'axios/' + pkg.version;
                if (data) {
                    if (utils.isArrayBuffer(data)) {
                        data = new Buffer(new Uint8Array(data));
                    } else if (utils.isString(data)) {
                        data = new Buffer(data, 'utf-8');
                    } else {
                        return reject(new Error('Data after transformation must be a string or an ArrayBuffer'));
                    }
                    headers['Content-Length'] = data.length;
                }
                var parsed = url.parse(config.url);
                var options = {
                        host: parsed.hostname,
                        port: parsed.port,
                        path: buildUrl(parsed.path, config.params).replace(/^\?/, ''),
                        method: config.method,
                        headers: headers
                    };
                var transport = parsed.protocol === 'https:' ? https : http;
                var req = transport.request(options, function (res) {
                        var responseText = '';
                        res.on('data', function (chunk) {
                            responseText += chunk;
                        });
                        res.on('end', function () {
                            var response = {
                                    data: transformData(responseText, res.headers, config.transformResponse),
                                    status: res.statusCode,
                                    headers: res.headers,
                                    config: config
                                };
                            (res.statusCode >= 200 && res.statusCode < 300 ? resolve : reject)(response);
                        });
                    });
                req.on('error', function (err) {
                    reject(err);
                });
                req.end(data);
            };
        },
        function (module, exports) {
            var defaults = _require(24);
            var utils = _require(32);
            var buildUrl = _require(25);
            var cookies = _require(26);
            var parseHeaders = _require(28);
            var transformData = _require(30);
            var urlIsSameOrigin = _require(31);
            module.exports = function xhrAdapter(resolve, reject, config) {
                var data = transformData(config.data, config.headers, config.transformRequest);
                var headers = utils.merge(defaults.headers.common, defaults.headers[config.method] || {}, config.headers || {});
                if (utils.isFormData(data)) {
                    delete headers['Content-Type'];
                }
                var request = new (XMLHttpRequest || ActiveXObject)('Microsoft.XMLHTTP');
                request.open(config.method.toUpperCase(), buildUrl(config.url, config.params), true);
                request.onreadystatechange = function () {
                    if (request && request.readyState === 4) {
                        var headers = parseHeaders(request.getAllResponseHeaders());
                        var response = {
                                data: transformData(request.responseText, headers, config.transformResponse),
                                status: request.status,
                                headers: headers,
                                config: config
                            };
                        (request.status >= 200 && request.status < 300 ? resolve : reject)(response);
                        request = null;
                    }
                };
                var xsrfValue = urlIsSameOrigin(config.url) ? cookies.read(config.xsrfCookieName || defaults.xsrfCookieName) : undefined;
                if (xsrfValue) {
                    headers[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue;
                }
                utils.forEach(headers, function (val, key) {
                    if (!data && key.toLowerCase() === 'content-type') {
                        delete headers[key];
                    } else {
                        request.setRequestHeader(key, val);
                    }
                });
                if (config.withCredentials) {
                    request.withCredentials = true;
                }
                if (config.responseType) {
                    try {
                        request.responseType = config.responseType;
                    } catch (e) {
                        if (request.responseType !== 'json') {
                            throw e;
                        }
                    }
                }
                if (utils.isArrayBuffer(data)) {
                    data = new DataView(data);
                }
                request.send(data);
            };
        },
        function (module, exports) {
            var defaults = _require(24);
            var utils = _require(32);
            var deprecatedMethod = _require(27);
            var dispatchRequest = _require(23);
            var InterceptorManager = _require(22);
            _require(33).polyfill();
            var axios = module.exports = function axios(config) {
                    config = utils.merge({
                        method: 'get',
                        headers: {},
                        transformRequest: defaults.transformRequest,
                        transformResponse: defaults.transformResponse
                    }, config);
                    config.withCredentials = config.withCredentials || defaults.withCredentials;
                    var chain = [
                            dispatchRequest,
                            undefined
                        ];
                    var promise = Promise.resolve(config);
                    axios.interceptors.request.forEach(function (interceptor) {
                        chain.unshift(interceptor.fulfilled, interceptor.rejected);
                    });
                    axios.interceptors.response.forEach(function (interceptor) {
                        chain.push(interceptor.fulfilled, interceptor.rejected);
                    });
                    while (chain.length) {
                        promise = promise.then(chain.shift(), chain.shift());
                    }
                    promise.success = function success(fn) {
                        deprecatedMethod('success', 'then', 'https://github.com/mzabriskie/axios/blob/master/README.md#response-api');
                        promise.then(function (response) {
                            fn(response.data, response.status, response.headers, response.config);
                        });
                        return promise;
                    };
                    promise.error = function error(fn) {
                        deprecatedMethod('error', 'catch', 'https://github.com/mzabriskie/axios/blob/master/README.md#response-api');
                        promise.then(null, function (response) {
                            fn(response.data, response.status, response.headers, response.config);
                        });
                        return promise;
                    };
                    return promise;
                };
            axios.defaults = defaults;
            axios.all = function (promises) {
                return Promise.all(promises);
            };
            axios.spread = _require(29);
            axios.interceptors = {
                request: new InterceptorManager(),
                response: new InterceptorManager()
            };
            createShortMethods('delete', 'get', 'head');
            createShortMethodsWithData('post', 'put', 'patch');
            function createShortMethods() {
                utils.forEach(arguments, function (method) {
                    axios[method] = function (url, config) {
                        return axios(utils.merge(config || {}, {
                            method: method,
                            url: url
                        }));
                    };
                });
            }
            function createShortMethodsWithData() {
                utils.forEach(arguments, function (method) {
                    axios[method] = function (url, data, config) {
                        return axios(utils.merge(config || {}, {
                            method: method,
                            url: url,
                            data: data
                        }));
                    };
                });
            }
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            function InterceptorManager() {
                this.handlers = [];
            }
            ;
            InterceptorManager.prototype.use = function (fulfilled, rejected) {
                this.handlers.push({
                    fulfilled: fulfilled,
                    rejected: rejected
                });
                return this.handlers.length - 1;
            };
            InterceptorManager.prototype.eject = function (id) {
                if (this.handlers[id]) {
                    this.handlers[id] = null;
                }
            };
            InterceptorManager.prototype.forEach = function (fn) {
                utils.forEach(this.handlers, function (h) {
                    if (h !== null) {
                        fn(h);
                    }
                });
            };
            module.exports = InterceptorManager;
        },
        function (module, exports) {
            'use strict';
            var Promise = _require(33).Promise;
            module.exports = function dispatchRequest(config) {
                return new Promise(function (resolve, reject) {
                    try {
                        if (typeof window !== 'undefined') {
                            _require(20)(resolve, reject, config);
                        } else if (typeof process !== 'undefined') {
                            _require(19)(resolve, reject, config);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            };
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            var JSON_START = /^\s*(\[|\{[^\{])/;
            var JSON_END = /[\}\]]\s*$/;
            var PROTECTION_PREFIX = /^\)\]\}',?\n/;
            var DEFAULT_CONTENT_TYPE = { 'Content-Type': 'application/x-www-form-urlencoded' };
            module.exports = {
                transformRequest: [function (data, headers) {
                        if (utils.isArrayBuffer(data)) {
                            return data;
                        }
                        if (utils.isArrayBufferView(data)) {
                            return data.buffer;
                        }
                        if (utils.isObject(data) && !utils.isFile(data) && !utils.isBlob(data)) {
                            if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
                                headers['Content-Type'] = 'application/json;charset=utf-8';
                            }
                            return JSON.stringify(data);
                        }
                        return data;
                    }],
                transformResponse: [function (data) {
                        if (typeof data === 'string') {
                            data = data.replace(PROTECTION_PREFIX, '');
                            if (JSON_START.test(data) && JSON_END.test(data)) {
                                data = JSON.parse(data);
                            }
                        }
                        return data;
                    }],
                headers: {
                    common: { 'Accept': 'application/json, text/plain, */*' },
                    patch: utils.merge(DEFAULT_CONTENT_TYPE),
                    post: utils.merge(DEFAULT_CONTENT_TYPE),
                    put: utils.merge(DEFAULT_CONTENT_TYPE)
                },
                xsrfCookieName: 'XSRF-TOKEN',
                xsrfHeaderName: 'X-XSRF-TOKEN'
            };
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            function encode(val) {
                return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+');
            }
            module.exports = function buildUrl(url, params) {
                if (!params) {
                    return url;
                }
                var parts = [];
                utils.forEach(params, function (val, key) {
                    if (val === null || typeof val === 'undefined') {
                        return;
                    }
                    if (!utils.isArray(val)) {
                        val = [val];
                    }
                    utils.forEach(val, function (v) {
                        if (utils.isDate(v)) {
                            v = v.toISOString();
                        } else if (utils.isObject(v)) {
                            v = JSON.stringify(v);
                        }
                        parts.push(encode(key) + '=' + encode(v));
                    });
                });
                if (parts.length > 0) {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
                }
                return url;
            };
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            module.exports = {
                write: function write(name, value, expires, path, domain, secure) {
                    var cookie = [];
                    cookie.push(name + '=' + encodeURIComponent(value));
                    if (utils.isNumber(expires)) {
                        cookie.push('expires=' + new Date(expires).toGMTString());
                    }
                    if (utils.isString(path)) {
                        cookie.push('path=' + path);
                    }
                    if (utils.isString(domain)) {
                        cookie.push('domain=' + domain);
                    }
                    if (secure === true) {
                        cookie.push('secure');
                    }
                    document.cookie = cookie.join('; ');
                },
                read: function read(name) {
                    var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
                    return match ? decodeURIComponent(match[3]) : null;
                },
                remove: function remove(name) {
                    this.write(name, '', Date.now() - 86400000);
                }
            };
        },
        function (module, exports) {
            'use strict';
            module.exports = function deprecatedMethod(method, instead, docs) {
                try {
                    console.warn('DEPRECATED method `' + method + '`.' + (instead ? ' Use `' + instead + '` instead.' : '') + ' This method will be removed in a future release.');
                    if (docs) {
                        console.warn('For more information about usage see ' + docs);
                    }
                } catch (e) {
                }
            };
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            module.exports = function parseHeaders(headers) {
                var parsed = {}, key, val, i;
                if (!headers)
                    return parsed;
                utils.forEach(headers.split('\n'), function (line) {
                    i = line.indexOf(':');
                    key = utils.trim(line.substr(0, i)).toLowerCase();
                    val = utils.trim(line.substr(i + 1));
                    if (key) {
                        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
                    }
                });
                return parsed;
            };
        },
        function (module, exports) {
            module.exports = function spread(callback) {
                return function (arr) {
                    callback.apply(null, arr);
                };
            };
        },
        function (module, exports) {
            'use strict';
            var utils = _require(32);
            module.exports = function transformData(data, headers, fns) {
                utils.forEach(fns, function (fn) {
                    data = fn(data, headers);
                });
                return data;
            };
        },
        function (module, exports) {
            'use strict';
            var msie = /(msie|trident)/i.test(navigator.userAgent);
            var utils = _require(32);
            var urlParsingNode = document.createElement('a');
            var originUrl = urlResolve(window.location.href);
            function urlResolve(url) {
                var href = url;
                if (msie) {
                    urlParsingNode.setAttribute('href', href);
                    href = urlParsingNode.href;
                }
                urlParsingNode.setAttribute('href', href);
                return {
                    href: urlParsingNode.href,
                    protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
                    host: urlParsingNode.host,
                    search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
                    hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
                    hostname: urlParsingNode.hostname,
                    port: urlParsingNode.port,
                    pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
                };
            }
            module.exports = function urlIsSameOrigin(requestUrl) {
                var parsed = utils.isString(requestUrl) ? urlResolve(requestUrl) : requestUrl;
                return parsed.protocol === originUrl.protocol && parsed.host === originUrl.host;
            };
        },
        function (module, exports) {
            var toString = Object.prototype.toString;
            function isArray(val) {
                return toString.call(val) === '[object Array]';
            }
            function isArrayBuffer(val) {
                return toString.call(val) === '[object ArrayBuffer]';
            }
            function isFormData(val) {
                return toString.call(val) === '[object FormData]';
            }
            function isArrayBufferView(val) {
                if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
                    return ArrayBuffer.isView(val);
                } else {
                    return val && val.buffer && val.buffer instanceof ArrayBuffer;
                }
            }
            function isString(val) {
                return typeof val === 'string';
            }
            function isNumber(val) {
                return typeof val === 'number';
            }
            function isUndefined(val) {
                return typeof val === 'undefined';
            }
            function isObject(val) {
                return val !== null && typeof val === 'object';
            }
            function isDate(val) {
                return toString.call(val) === '[object Date]';
            }
            function isFile(val) {
                return toString.call(val) === '[object File]';
            }
            function isBlob(val) {
                return toString.call(val) === '[object Blob]';
            }
            function trim(str) {
                return str.replace(/^\s*/, '').replace(/\s*$/, '');
            }
            function forEach(obj, fn) {
                if (obj === null || typeof obj === 'undefined') {
                    return;
                }
                var isArray = obj.constructor === Array || typeof obj.callee === 'function';
                if (typeof obj !== 'object' && !isArray) {
                    obj = [obj];
                }
                if (isArray) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        fn.call(null, obj[i], i, obj);
                    }
                } else {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            fn.call(null, obj[key], key, obj);
                        }
                    }
                }
            }
            function merge(obj1) {
                var result = {};
                forEach(arguments, function (obj) {
                    forEach(obj, function (val, key) {
                        result[key] = val;
                    });
                });
                return result;
            }
            module.exports = {
                isArray: isArray,
                isArrayBuffer: isArrayBuffer,
                isFormData: isFormData,
                isArrayBufferView: isArrayBufferView,
                isString: isString,
                isNumber: isNumber,
                isObject: isObject,
                isUndefined: isUndefined,
                isDate: isDate,
                isFile: isFile,
                isBlob: isBlob,
                forEach: forEach,
                merge: merge,
                trim: trim
            };
        },
        function (module, exports) {
            (function () {
                'use strict';
                function $$utils$$objectOrFunction(x) {
                    return typeof x === 'function' || typeof x === 'object' && x !== null;
                }
                function $$utils$$isFunction(x) {
                    return typeof x === 'function';
                }
                function $$utils$$isMaybeThenable(x) {
                    return typeof x === 'object' && x !== null;
                }
                var $$utils$$_isArray;
                if (!Array.isArray) {
                    $$utils$$_isArray = function (x) {
                        return Object.prototype.toString.call(x) === '[object Array]';
                    };
                } else {
                    $$utils$$_isArray = Array.isArray;
                }
                var $$utils$$isArray = $$utils$$_isArray;
                var $$utils$$now = Date.now || function () {
                        return new Date().getTime();
                    };
                function $$utils$$F() {
                }
                var $$utils$$o_create = Object.create || function (o) {
                        if (arguments.length > 1) {
                            throw new Error('Second argument not supported');
                        }
                        if (typeof o !== 'object') {
                            throw new TypeError('Argument must be an object');
                        }
                        $$utils$$F.prototype = o;
                        return new $$utils$$F();
                    };
                var $$asap$$len = 0;
                var $$asap$$default = function asap(callback, arg) {
                    $$asap$$queue[$$asap$$len] = callback;
                    $$asap$$queue[$$asap$$len + 1] = arg;
                    $$asap$$len += 2;
                    if ($$asap$$len === 2) {
                        $$asap$$scheduleFlush();
                    }
                };
                var $$asap$$browserGlobal = typeof window !== 'undefined' ? window : {};
                var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;
                var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
                function $$asap$$useNextTick() {
                    return function () {
                        process.nextTick($$asap$$flush);
                    };
                }
                function $$asap$$useMutationObserver() {
                    var iterations = 0;
                    var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
                    var node = document.createTextNode('');
                    observer.observe(node, { characterData: true });
                    return function () {
                        node.data = iterations = ++iterations % 2;
                    };
                }
                function $$asap$$useMessageChannel() {
                    var channel = new MessageChannel();
                    channel.port1.onmessage = $$asap$$flush;
                    return function () {
                        channel.port2.postMessage(0);
                    };
                }
                function $$asap$$useSetTimeout() {
                    return function () {
                        setTimeout($$asap$$flush, 1);
                    };
                }
                var $$asap$$queue = new Array(1000);
                function $$asap$$flush() {
                    for (var i = 0; i < $$asap$$len; i += 2) {
                        var callback = $$asap$$queue[i];
                        var arg = $$asap$$queue[i + 1];
                        callback(arg);
                        $$asap$$queue[i] = undefined;
                        $$asap$$queue[i + 1] = undefined;
                    }
                    $$asap$$len = 0;
                }
                var $$asap$$scheduleFlush;
                if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
                    $$asap$$scheduleFlush = $$asap$$useNextTick();
                } else if ($$asap$$BrowserMutationObserver) {
                    $$asap$$scheduleFlush = $$asap$$useMutationObserver();
                } else if ($$asap$$isWorker) {
                    $$asap$$scheduleFlush = $$asap$$useMessageChannel();
                } else {
                    $$asap$$scheduleFlush = $$asap$$useSetTimeout();
                }
                function $$$internal$$noop() {
                }
                var $$$internal$$PENDING = void 0;
                var $$$internal$$FULFILLED = 1;
                var $$$internal$$REJECTED = 2;
                var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();
                function $$$internal$$selfFullfillment() {
                    return new TypeError('You cannot resolve a promise with itself');
                }
                function $$$internal$$cannotReturnOwn() {
                    return new TypeError('A promises callback cannot return that same promise.');
                }
                function $$$internal$$getThen(promise) {
                    try {
                        return promise.then;
                    } catch (error) {
                        $$$internal$$GET_THEN_ERROR.error = error;
                        return $$$internal$$GET_THEN_ERROR;
                    }
                }
                function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
                    try {
                        then.call(value, fulfillmentHandler, rejectionHandler);
                    } catch (e) {
                        return e;
                    }
                }
                function $$$internal$$handleForeignThenable(promise, thenable, then) {
                    $$asap$$default(function (promise) {
                        var sealed = false;
                        var error = $$$internal$$tryThen(then, thenable, function (value) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;
                                if (thenable !== value) {
                                    $$$internal$$resolve(promise, value);
                                } else {
                                    $$$internal$$fulfill(promise, value);
                                }
                            }, function (reason) {
                                if (sealed) {
                                    return;
                                }
                                sealed = true;
                                $$$internal$$reject(promise, reason);
                            }, 'Settle: ' + (promise._label || ' unknown promise'));
                        if (!sealed && error) {
                            sealed = true;
                            $$$internal$$reject(promise, error);
                        }
                    }, promise);
                }
                function $$$internal$$handleOwnThenable(promise, thenable) {
                    if (thenable._state === $$$internal$$FULFILLED) {
                        $$$internal$$fulfill(promise, thenable._result);
                    } else if (promise._state === $$$internal$$REJECTED) {
                        $$$internal$$reject(promise, thenable._result);
                    } else {
                        $$$internal$$subscribe(thenable, undefined, function (value) {
                            $$$internal$$resolve(promise, value);
                        }, function (reason) {
                            $$$internal$$reject(promise, reason);
                        });
                    }
                }
                function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
                    if (maybeThenable.constructor === promise.constructor) {
                        $$$internal$$handleOwnThenable(promise, maybeThenable);
                    } else {
                        var then = $$$internal$$getThen(maybeThenable);
                        if (then === $$$internal$$GET_THEN_ERROR) {
                            $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
                        } else if (then === undefined) {
                            $$$internal$$fulfill(promise, maybeThenable);
                        } else if ($$utils$$isFunction(then)) {
                            $$$internal$$handleForeignThenable(promise, maybeThenable, then);
                        } else {
                            $$$internal$$fulfill(promise, maybeThenable);
                        }
                    }
                }
                function $$$internal$$resolve(promise, value) {
                    if (promise === value) {
                        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
                    } else if ($$utils$$objectOrFunction(value)) {
                        $$$internal$$handleMaybeThenable(promise, value);
                    } else {
                        $$$internal$$fulfill(promise, value);
                    }
                }
                function $$$internal$$publishRejection(promise) {
                    if (promise._onerror) {
                        promise._onerror(promise._result);
                    }
                    $$$internal$$publish(promise);
                }
                function $$$internal$$fulfill(promise, value) {
                    if (promise._state !== $$$internal$$PENDING) {
                        return;
                    }
                    promise._result = value;
                    promise._state = $$$internal$$FULFILLED;
                    if (promise._subscribers.length === 0) {
                    } else {
                        $$asap$$default($$$internal$$publish, promise);
                    }
                }
                function $$$internal$$reject(promise, reason) {
                    if (promise._state !== $$$internal$$PENDING) {
                        return;
                    }
                    promise._state = $$$internal$$REJECTED;
                    promise._result = reason;
                    $$asap$$default($$$internal$$publishRejection, promise);
                }
                function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
                    var subscribers = parent._subscribers;
                    var length = subscribers.length;
                    parent._onerror = null;
                    subscribers[length] = child;
                    subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
                    subscribers[length + $$$internal$$REJECTED] = onRejection;
                    if (length === 0 && parent._state) {
                        $$asap$$default($$$internal$$publish, parent);
                    }
                }
                function $$$internal$$publish(promise) {
                    var subscribers = promise._subscribers;
                    var settled = promise._state;
                    if (subscribers.length === 0) {
                        return;
                    }
                    var child, callback, detail = promise._result;
                    for (var i = 0; i < subscribers.length; i += 3) {
                        child = subscribers[i];
                        callback = subscribers[i + settled];
                        if (child) {
                            $$$internal$$invokeCallback(settled, child, callback, detail);
                        } else {
                            callback(detail);
                        }
                    }
                    promise._subscribers.length = 0;
                }
                function $$$internal$$ErrorObject() {
                    this.error = null;
                }
                var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();
                function $$$internal$$tryCatch(callback, detail) {
                    try {
                        return callback(detail);
                    } catch (e) {
                        $$$internal$$TRY_CATCH_ERROR.error = e;
                        return $$$internal$$TRY_CATCH_ERROR;
                    }
                }
                function $$$internal$$invokeCallback(settled, promise, callback, detail) {
                    var hasCallback = $$utils$$isFunction(callback), value, error, succeeded, failed;
                    if (hasCallback) {
                        value = $$$internal$$tryCatch(callback, detail);
                        if (value === $$$internal$$TRY_CATCH_ERROR) {
                            failed = true;
                            error = value.error;
                            value = null;
                        } else {
                            succeeded = true;
                        }
                        if (promise === value) {
                            $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
                            return;
                        }
                    } else {
                        value = detail;
                        succeeded = true;
                    }
                    if (promise._state !== $$$internal$$PENDING) {
                    } else if (hasCallback && succeeded) {
                        $$$internal$$resolve(promise, value);
                    } else if (failed) {
                        $$$internal$$reject(promise, error);
                    } else if (settled === $$$internal$$FULFILLED) {
                        $$$internal$$fulfill(promise, value);
                    } else if (settled === $$$internal$$REJECTED) {
                        $$$internal$$reject(promise, value);
                    }
                }
                function $$$internal$$initializePromise(promise, resolver) {
                    try {
                        resolver(function resolvePromise(value) {
                            $$$internal$$resolve(promise, value);
                        }, function rejectPromise(reason) {
                            $$$internal$$reject(promise, reason);
                        });
                    } catch (e) {
                        $$$internal$$reject(promise, e);
                    }
                }
                function $$$enumerator$$makeSettledResult(state, position, value) {
                    if (state === $$$internal$$FULFILLED) {
                        return {
                            state: 'fulfilled',
                            value: value
                        };
                    } else {
                        return {
                            state: 'rejected',
                            reason: value
                        };
                    }
                }
                function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
                    this._instanceConstructor = Constructor;
                    this.promise = new Constructor($$$internal$$noop, label);
                    this._abortOnReject = abortOnReject;
                    if (this._validateInput(input)) {
                        this._input = input;
                        this.length = input.length;
                        this._remaining = input.length;
                        this._init();
                        if (this.length === 0) {
                            $$$internal$$fulfill(this.promise, this._result);
                        } else {
                            this.length = this.length || 0;
                            this._enumerate();
                            if (this._remaining === 0) {
                                $$$internal$$fulfill(this.promise, this._result);
                            }
                        }
                    } else {
                        $$$internal$$reject(this.promise, this._validationError());
                    }
                }
                $$$enumerator$$Enumerator.prototype._validateInput = function (input) {
                    return $$utils$$isArray(input);
                };
                $$$enumerator$$Enumerator.prototype._validationError = function () {
                    return new Error('Array Methods must be provided an Array');
                };
                $$$enumerator$$Enumerator.prototype._init = function () {
                    this._result = new Array(this.length);
                };
                var $$$enumerator$$default = $$$enumerator$$Enumerator;
                $$$enumerator$$Enumerator.prototype._enumerate = function () {
                    var length = this.length;
                    var promise = this.promise;
                    var input = this._input;
                    for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
                        this._eachEntry(input[i], i);
                    }
                };
                $$$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
                    var c = this._instanceConstructor;
                    if ($$utils$$isMaybeThenable(entry)) {
                        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
                            entry._onerror = null;
                            this._settledAt(entry._state, i, entry._result);
                        } else {
                            this._willSettleAt(c.resolve(entry), i);
                        }
                    } else {
                        this._remaining--;
                        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
                    }
                };
                $$$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
                    var promise = this.promise;
                    if (promise._state === $$$internal$$PENDING) {
                        this._remaining--;
                        if (this._abortOnReject && state === $$$internal$$REJECTED) {
                            $$$internal$$reject(promise, value);
                        } else {
                            this._result[i] = this._makeResult(state, i, value);
                        }
                    }
                    if (this._remaining === 0) {
                        $$$internal$$fulfill(promise, this._result);
                    }
                };
                $$$enumerator$$Enumerator.prototype._makeResult = function (state, i, value) {
                    return value;
                };
                $$$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
                    var enumerator = this;
                    $$$internal$$subscribe(promise, undefined, function (value) {
                        enumerator._settledAt($$$internal$$FULFILLED, i, value);
                    }, function (reason) {
                        enumerator._settledAt($$$internal$$REJECTED, i, reason);
                    });
                };
                var $$promise$all$$default = function all(entries, label) {
                    return new $$$enumerator$$default(this, entries, true, label).promise;
                };
                var $$promise$race$$default = function race(entries, label) {
                    var Constructor = this;
                    var promise = new Constructor($$$internal$$noop, label);
                    if (!$$utils$$isArray(entries)) {
                        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
                        return promise;
                    }
                    var length = entries.length;
                    function onFulfillment(value) {
                        $$$internal$$resolve(promise, value);
                    }
                    function onRejection(reason) {
                        $$$internal$$reject(promise, reason);
                    }
                    for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
                        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
                    }
                    return promise;
                };
                var $$promise$resolve$$default = function resolve(object, label) {
                    var Constructor = this;
                    if (object && typeof object === 'object' && object.constructor === Constructor) {
                        return object;
                    }
                    var promise = new Constructor($$$internal$$noop, label);
                    $$$internal$$resolve(promise, object);
                    return promise;
                };
                var $$promise$reject$$default = function reject(reason, label) {
                    var Constructor = this;
                    var promise = new Constructor($$$internal$$noop, label);
                    $$$internal$$reject(promise, reason);
                    return promise;
                };
                var $$es6$promise$promise$$counter = 0;
                function $$es6$promise$promise$$needsResolver() {
                    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
                }
                function $$es6$promise$promise$$needsNew() {
                    throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
                }
                var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;
                function $$es6$promise$promise$$Promise(resolver) {
                    this._id = $$es6$promise$promise$$counter++;
                    this._state = undefined;
                    this._result = undefined;
                    this._subscribers = [];
                    if ($$$internal$$noop !== resolver) {
                        if (!$$utils$$isFunction(resolver)) {
                            $$es6$promise$promise$$needsResolver();
                        }
                        if (!(this instanceof $$es6$promise$promise$$Promise)) {
                            $$es6$promise$promise$$needsNew();
                        }
                        $$$internal$$initializePromise(this, resolver);
                    }
                }
                $$es6$promise$promise$$Promise.all = $$promise$all$$default;
                $$es6$promise$promise$$Promise.race = $$promise$race$$default;
                $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
                $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;
                $$es6$promise$promise$$Promise.prototype = {
                    constructor: $$es6$promise$promise$$Promise,
                    then: function (onFulfillment, onRejection) {
                        var parent = this;
                        var state = parent._state;
                        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
                            return this;
                        }
                        var child = new this.constructor($$$internal$$noop);
                        var result = parent._result;
                        if (state) {
                            var callback = arguments[state - 1];
                            $$asap$$default(function () {
                                $$$internal$$invokeCallback(state, child, callback, result);
                            });
                        } else {
                            $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
                        }
                        return child;
                    },
                    'catch': function (onRejection) {
                        return this.then(null, onRejection);
                    }
                };
                var $$es6$promise$polyfill$$default = function polyfill() {
                    var local;
                    if (typeof global !== 'undefined') {
                        local = global;
                    } else if (typeof window !== 'undefined' && window.document) {
                        local = window;
                    } else {
                        local = self;
                    }
                    var es6PromiseSupport = 'Promise' in local && 'resolve' in local.Promise && 'reject' in local.Promise && 'all' in local.Promise && 'race' in local.Promise && function () {
                            var resolve;
                            new local.Promise(function (r) {
                                resolve = r;
                            });
                            return $$utils$$isFunction(resolve);
                        }();
                    if (!es6PromiseSupport) {
                        local.Promise = $$es6$promise$promise$$default;
                    }
                };
                var es6$promise$umd$$ES6Promise = {
                        'Promise': $$es6$promise$promise$$default,
                        'polyfill': $$es6$promise$polyfill$$default
                    };
                if (typeof define === 'function' && define['amd']) {
                    define(function () {
                        return es6$promise$umd$$ES6Promise;
                    });
                } else if (typeof module !== 'undefined' && module['exports']) {
                    module['exports'] = es6$promise$umd$$ES6Promise;
                } else if (typeof this !== 'undefined') {
                    this['ES6Promise'] = es6$promise$umd$$ES6Promise;
                }
            }.call(this));
        },
        function (module, exports) {
            module.exports = {
                'name': 'axios',
                'version': '0.5.0',
                'description': 'Promise based HTTP client for the browser and node.js',
                'main': 'index.js',
                'scripts': {
                    'test': 'grunt test',
                    'start': 'node ./sandbox/server.js'
                },
                'repository': {
                    'type': 'git',
                    'url': 'https://github.com/mzabriskie/axios.git'
                },
                'keywords': [
                    'xhr',
                    'http',
                    'ajax',
                    'promise',
                    'node'
                ],
                'author': { 'name': 'Matt Zabriskie' },
                'license': 'MIT',
                'bugs': { 'url': 'https://github.com/mzabriskie/axios/issues' },
                'homepage': 'https://github.com/mzabriskie/axios',
                'dependencies': { 'es6-promise': '^2.0.1' },
                'devDependencies': {
                    'grunt': '^0.4.5',
                    'grunt-banner': '^0.2.3',
                    'grunt-contrib-clean': '^0.6.0',
                    'grunt-contrib-nodeunit': '^0.4.1',
                    'grunt-contrib-watch': '^0.6.1',
                    'grunt-karma': '^0.8.3',
                    'grunt-ts': '^1.12.1',
                    'grunt-update-json': '^0.1.3',
                    'grunt-webpack': '^1.0.8',
                    'karma': '^0.12.21',
                    'karma-jasmine': '^0.1.5',
                    'karma-jasmine-ajax': '^0.1.4',
                    'karma-phantomjs-launcher': '^0.1.4',
                    'load-grunt-tasks': '^0.6.0',
                    'webpack': '^1.4.0-beta9',
                    'webpack-dev-server': '^1.4.10'
                },
                'browser': { './lib/adapters/http.js': './lib/adapters/xhr.js' },
                'gitHead': 'fa6c26a0e5eaad5d58071eb39d7afff0c7dc051c',
                '_id': 'axios@0.5.0',
                '_shasum': '2f369e6309a46b182c38ce683ba4fbc608d5b4ef',
                '_from': 'axios@',
                '_npmVersion': '2.1.6',
                '_nodeVersion': '0.10.33',
                '_npmUser': {
                    'name': 'mzabriskie',
                    'email': 'mzabriskie@gmail.com'
                },
                'maintainers': [{
                        'name': 'mzabriskie',
                        'email': 'mzabriskie@gmail.com'
                    }],
                'dist': {
                    'shasum': '2f369e6309a46b182c38ce683ba4fbc608d5b4ef',
                    'tarball': 'http://registry.npmjs.org/axios/-/axios-0.5.0.tgz'
                },
                'directories': {},
                '_resolved': 'https://registry.npmjs.org/axios/-/axios-0.5.0.tgz'
            };
        },
        function (module, exports) {
            module.exports = __external_axolotlCrypto;
        },
        function (module, exports) {
            module.exports = __external_axolotl;
        },
        function (module, exports) {
            var slice = Array.prototype.slice;
            module.exports = co['default'] = co.co = co;
            co.wrap = function (fn) {
                createPromise.__generatorFunction__ = fn;
                return createPromise;
                function createPromise() {
                    return co.call(this, fn.apply(this, arguments));
                }
            };
            function co(gen) {
                var ctx = this;
                if (typeof gen === 'function')
                    gen = gen.call(this);
                return new Promise(function (resolve, reject) {
                    onFulfilled();
                    function onFulfilled(res) {
                        var ret;
                        try {
                            ret = gen.next(res);
                        } catch (e) {
                            return reject(e);
                        }
                        next(ret);
                    }
                    function onRejected(err) {
                        var ret;
                        try {
                            ret = gen.throw(err);
                        } catch (e) {
                            return reject(e);
                        }
                        next(ret);
                    }
                    function next(ret) {
                        if (ret.done)
                            return resolve(ret.value);
                        var value = toPromise.call(ctx, ret.value);
                        if (value && isPromise(value))
                            return value.then(onFulfilled, onRejected);
                        return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following object was passed: "' + String(ret.value) + '"'));
                    }
                });
            }
            function toPromise(obj) {
                if (!obj)
                    return obj;
                if (isPromise(obj))
                    return obj;
                if (isGeneratorFunction(obj) || isGenerator(obj))
                    return co.call(this, obj);
                if ('function' == typeof obj)
                    return thunkToPromise.call(this, obj);
                if (Array.isArray(obj))
                    return arrayToPromise.call(this, obj);
                if (isObject(obj))
                    return objectToPromise.call(this, obj);
                return obj;
            }
            function thunkToPromise(fn) {
                var ctx = this;
                return new Promise(function (resolve, reject) {
                    fn.call(ctx, function (err, res) {
                        if (err)
                            return reject(err);
                        if (arguments.length > 2)
                            res = slice.call(arguments, 1);
                        resolve(res);
                    });
                });
            }
            function arrayToPromise(obj) {
                return Promise.all(obj.map(toPromise, this));
            }
            function objectToPromise(obj) {
                var results = new obj.constructor();
                var keys = Object.keys(obj);
                var promises = [];
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var promise = toPromise.call(this, obj[key]);
                    if (promise && isPromise(promise))
                        defer(promise, key);
                    else
                        results[key] = obj[key];
                }
                return Promise.all(promises).then(function () {
                    return results;
                });
                function defer(promise, key) {
                    results[key] = undefined;
                    promises.push(promise.then(function (res) {
                        results[key] = res;
                    }));
                }
            }
            function isPromise(obj) {
                return 'function' == typeof obj.then;
            }
            function isGenerator(obj) {
                return 'function' == typeof obj.next && 'function' == typeof obj.throw;
            }
            function isGeneratorFunction(obj) {
                var constructor = obj.constructor;
                if (!constructor)
                    return false;
                if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName)
                    return true;
                return isGenerator(constructor.prototype);
            }
            function isObject(val) {
                return Object == val.constructor;
            }
        },
        function (module, exports) {
            module.exports = __external_1;
        },
        function (module, exports) {
            module.exports = __external_url;
        }
    ];
    return _require(1);
}));