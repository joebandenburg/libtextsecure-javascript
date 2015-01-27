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

import IncomingPushMessageSignalProtos from "./IncomingPushMessageSignalProtos";
import {unpadMessage} from "./MessagePadder";
import Contact from "./Contact";
import co from "co";

var IncomingPushMessageSignalProto = IncomingPushMessageSignalProtos.IncomingPushMessageSignal;
var MessageType = IncomingPushMessageSignalProto.Type;
var PushMessageContentProto = IncomingPushMessageSignalProtos.PushMessageContent;

/**
 *
 * @param {Store} store
 * @param {Axolotl} axolotl
 * @param {SignalingCipher} signalingCipher
 * @constructor
 */
function MessageReceiver(store, axolotl, signalingCipher) {
    this.onpushmessagecontent = () => {};
    this.onreceipt = () => {};

    /**
     * @method
     * @param {ArrayBuffer} encryptedIncomingPushMessageSignalBytes
     * @returns {Promise.<Object>} a push message content object
     */
    this.processIncomingMessageSignal = co.wrap(function*(encryptedIncomingPushMessageSignalBytes) {
        var incomingPushMessageSignalBytes = yield signalingCipher.decrypt(encryptedIncomingPushMessageSignalBytes);
        var incomingPushMessageSignal = decodeIncomingPushMessageSignal(incomingPushMessageSignalBytes);
        switch (incomingPushMessageSignal.type) {
            case MessageType.PREKEY_BUNDLE:
            case MessageType.CIPHERTEXT:
                var {
                    contact,
                    device
                } = yield getContactAndDevice(incomingPushMessageSignal.source,
                    incomingPushMessageSignal.sourceDevice);
                var isPreKeyWhisperMessage = incomingPushMessageSignal.type === MessageType.PREKEY_BUNDLE;
                var decryptionResult = yield decryptPushMessageContent(isPreKeyWhisperMessage,
                    incomingPushMessageSignal.message, device.axolotlSession);
                device.axolotlSession = decryptionResult.session;
                var paddedPushMessageContentBytes = decryptionResult.message;
                var pushMessageContentBytes = unpadMessage(paddedPushMessageContentBytes);
                var pushMessageContent = PushMessageContentProto.decode(pushMessageContentBytes);
                yield store.putContact(incomingPushMessageSignal.source, contact);
                processPushMessageContent(incomingPushMessageSignal, pushMessageContent);
                break;
            case MessageType.RECEIPT:
                self.onreceipt(incomingPushMessageSignal.source, incomingPushMessageSignal.timestamp);
                break;
            default:
                throw new Error("Unhandled incoming push message signal type " + incomingPushMessageSignal.type);
        }
    });

    var getContactAndDevice = co.wrap(function*(number, deviceId) {
        var hasContact = yield store.hasContact(number);
        var contact;
        var device;
        if (!hasContact) {
            contact = new Contact();
        } else {
            contact = yield store.getContact(number);
            contact = new Contact(contact);
            device = contact.getDevice(deviceId);
        }
        if (!device) {
            device = {
                id: deviceId
            };
            contact.devices.push(device);
        }
        return {
            contact,
            device
        };
    });

    var self = this;

    var decodeIncomingPushMessageSignal = (incomingPushMessageSignalBytes) => {
        var incomingPushMessageSignal = IncomingPushMessageSignalProto.decode(incomingPushMessageSignalBytes);
        if (incomingPushMessageSignal.message) {
            incomingPushMessageSignal.message = incomingPushMessageSignal.message.toArrayBuffer();
        }
        if (incomingPushMessageSignal.timestamp) {
            incomingPushMessageSignal.timestamp = incomingPushMessageSignal.timestamp.toNumber();
        }
        return incomingPushMessageSignal;
    };

    var decryptPushMessageContent = co.wrap(function*(isPreKeyWhisperMessage, encryptedPushMessageContent, session) {
        if (isPreKeyWhisperMessage) {
            // TODO: Identity key
            // TODO: Handle exceptions
            // TODO: Maybe generate more prekeys
            return yield axolotl.decryptPreKeyWhisperMessage(session, encryptedPushMessageContent);
        } else {
            if (!session) {
                // TODO: Better error
                throw new Error("No pre-existing session");
            }
            // TODO: Handle exceptions
            return yield axolotl.decryptWhisperMessage(session, encryptedPushMessageContent);
        }
    });

    var processPushMessageContent = (incomingPushMessageSignal, pushMessageContent) => {
        // TODO: Handle group content
        // TODO: Handle attachments
        // TODO: Handle flags
        // TODO: Handle session end
        // TODO: Send receipt
        self.onpushmessagecontent(incomingPushMessageSignal.source, pushMessageContent.body,
            incomingPushMessageSignal.timestamp);
    };
}

export default MessageReceiver;
