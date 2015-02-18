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

import ArrayBufferUtils from "./ArrayBufferUtils";
import co from "co";

/**
 *
 * @param {ArrayBuffer} signalingCipherKey - a 32-byte AES key
 * @param {ArrayBuffer} signalingMacKey - a 20-byte HMAC key
 * @param {Object} crypto
 * @constructor
 */
function SignalingCipher(signalingCipherKey, signalingMacKey, crypto) {
    /**
     * @method
     * @param {ArrayBuffer} encryptedIncomingPushMessageSignalBytes
     * @returns {Promise.<ArrayBuffer>} the unencrypted bytes of a IncomingPushMessageSignal
     */
    this.decrypt = co.wrap(function*(encryptedIncomingPushMessageSignalBytes) {
        if (encryptedIncomingPushMessageSignalBytes.byteLength <= 1 + 16 + 10) {
            throw new Error("Malformed incoming push message signal");
        }

        var versionByte = new Uint8Array(encryptedIncomingPushMessageSignalBytes)[0];
        if (versionByte !== 1) {
            // TODO: Better errors
            throw new Error("Unsupported incoming push message signal version");
        }

        var ivBytes = encryptedIncomingPushMessageSignalBytes.slice(1, 17);
        var encryptedBytes = encryptedIncomingPushMessageSignalBytes.slice(17, -10);
        var macBytes = encryptedIncomingPushMessageSignalBytes.slice(-10);

        var incomingPushMessageSignalBytes = yield Promise.resolve(
            crypto.decrypt(signalingCipherKey, encryptedBytes, ivBytes));

        var bytesToMac = encryptedIncomingPushMessageSignalBytes.slice(0, -10);
        var expectedMacBytes = yield Promise.resolve(crypto.hmac(signalingMacKey, bytesToMac));
        if (!ArrayBufferUtils.areEqual(macBytes, expectedMacBytes.slice(0, 10))) {
            // TODO: Better errors
            throw new Error("Invalid mac on incoming push message signal");
        }
        return incomingPushMessageSignalBytes;
    });
}

export default SignalingCipher;
