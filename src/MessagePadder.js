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

/**
 * Pad the message to one byte less than the block size using ISO/IEC 7816-4:2005 padding.
 * <p>
 * We pad to one byte less because axolotl provides its own padding scheme.
 *
 * @param {ArrayBuffer} message
 * @param {number} blockSize
 * @returns {ArrayBuffer} the padded message
 */
export var padMessage = (message, blockSize) => {
    var byteCountInFinalBlock = (message.byteLength % blockSize);
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
    paddedMessage[message.byteLength] = 0x80;
    return paddedMessage.buffer;
};

/**
 * Removes padding from the message. The length of the padding does not need to be specified.
 * @param {ArrayBuffer} paddedMessage
 * @returns {ArrayBuffer}
 */
export var unpadMessage = (paddedMessage) => {
    var paddedMessageBytes = new Uint8Array(paddedMessage);
    for (var messageLength = paddedMessage.byteLength - 1; messageLength > 0; messageLength--) {
        if (paddedMessageBytes[messageLength] === 0x80) {
            break;
        } else if (paddedMessageBytes[messageLength] !== 0) {
            // TODO: Better error
            throw new Error("Malformed padding");
        }
    }
    var message = new Uint8Array(messageLength);
    message.set(paddedMessageBytes.subarray(0, messageLength), 0);
    return message.buffer;
};
