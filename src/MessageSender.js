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
import Protocol from "./Protocol";
import {padMessage} from "./MessagePadder";
import {MismatchedDevicesException, StaleDevicesException} from "./Exceptions";
import Contact from "./Contact";
import Axolotl from "axolotl";
import co from "co";

var IncomingPushMessageSignalProto = IncomingPushMessageSignalProtos.IncomingPushMessageSignal;
var PushMessageContentProto = IncomingPushMessageSignalProtos.PushMessageContent;

/*
store = {
    hasContact(number)
    getContact(number) -> contact
    putContact(number, contact)
}

contact = {
    identityKey: ...,
    devices: [{
        id: 1,
        preKey: ...,
        signedPreKey: ...,
        axolotlState: ...
    }]
}
 */

var paddingBlockSize = 160;
var sendMessageRetryAttemptLimit = 5;

function MessageSender(store, axolotl, protocol) {
    this.sendMessage = co.wrap(function*(toNumber, messageText, timestamp, attachments) {
        var paddedPushMessageContentBytes = constructMessageContent(messageText, attachments);

        var hasContact = yield store.hasContact(toNumber);
        if (!hasContact) {
            var preKeys = yield protocol.getPreKeys(toNumber);
            var newContact = new Contact({
                identityKey: preKeys.identityKey,
                devices: []
            });
            yield addDevices(newContact, preKeys);
            yield store.putContact(toNumber, newContact);
        }

        var contact = new Contact(yield store.getContact(toNumber));

        var sendMessageToContact = co.wrap(function*() {
            var messages = yield contact.devices.map(co.wrap(function*(device) {
                var {
                    isPreKeyWhisperMessage,
                    body: encryptedPushMessageContentBytes,
                    session: newAxolotlSession
                    } = yield axolotl.encryptMessage(device.axolotlSession, paddedPushMessageContentBytes);
                device.axolotlSession = newAxolotlSession;
                var type = (isPreKeyWhisperMessage) ?
                    IncomingPushMessageSignalProto.Type.PREKEY_BUNDLE :
                    IncomingPushMessageSignalProto.Type.CIPHERTEXT;
                return {
                    type: type,
                    destinationDeviceId: device.id,
                    destinationRegistrationId: device.registrationId,
                    body: encryptedPushMessageContentBytes,
                    timestamp: timestamp
                };
            }));
            yield protocol.submitMessage(toNumber, messages);
        });

        var attemptToSendMessageToContact = co.wrap(function*(retriesRemaining) {
            if (retriesRemaining === 0) {
                throw new Error("Giving up after " + sendMessageRetryAttemptLimit + " attempts to send message");
            }
            yield sendMessageToContact().catch(co.wrap(function*(response) {
                if (response instanceof MismatchedDevicesException) {
                    contact.removeDevices(response.extraDevices);

                    yield response.missingDevices.map(co.wrap(function*(id) {
                        var preKeys = yield protocol.getPreKeys(toNumber, id);
                        yield addDevices(contact, preKeys);
                    }));
                    return yield attemptToSendMessageToContact(retriesRemaining - 1);
                } else if (response instanceof StaleDevicesException) {
                    contact.removeDevices(response.staleDevices);
                    return yield attemptToSendMessageToContact(retriesRemaining - 1);
                }
                return yield Promise.reject(response);
            }));
        });

        yield attemptToSendMessageToContact(sendMessageRetryAttemptLimit);
        yield store.putContact(toNumber, contact);
    });

    var addDevices = co.wrap(function*(contact, preKeys) {
        yield preKeys.devices.map(co.wrap(function*(preKeyDevice) {
            var device = {
                id: preKeyDevice.deviceId,
                registrationId: preKeyDevice.registrationId,
                signedPreKey: {
                    id: preKeyDevice.signedPreKey.keyId,
                    publicKey: preKeyDevice.signedPreKey.publicKey,
                    signature: preKeyDevice.signedPreKey.signature
                },
                axolotlSession: yield axolotl.createSessionFromPreKeyBundle({
                    identityKey: preKeys.identityKey,
                    preKeyId: preKeyDevice.preKey.keyId,
                    preKey: preKeyDevice.preKey.publicKey,
                    signedPreKeyId: preKeyDevice.signedPreKey.keyId,
                    signedPreKey: preKeyDevice.signedPreKey.publicKey,
                    signedPreKeySignature: preKeyDevice.signedPreKey.signature
                })
            };
            contact.devices.push(device);
        }));
    });

    var constructMessageContent = (messageText, attachments) => {
        var pushMessageContent = {
            body: messageText
        };
        var pushMessageContentBytes = new PushMessageContentProto(pushMessageContent).encode().toArrayBuffer();
        return padMessage(pushMessageContentBytes, paddingBlockSize);
    };
}

export default MessageSender;
