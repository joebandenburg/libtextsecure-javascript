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

import AccountCreator from "./AccountCreator";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
import Protocol from "./Protocol";
import SignalingCipher from "./SignalingCipher";
import WebSocketPushTransport from "./WebSocketPushTransport";

import axolotl from "axolotl";
import axolotlCrypto from "axolotl-crypto";
import axios from "axios";
import co from "co";

function TextSecure(store, endpoint) {
    this.onmessage = () => {};
    this.onreceipt = () => {};

    /**
     * @method
     * @param {String} number - An E164 phone number
     */
    this.sendMessage = co.wrap(function*(number, message, attachments) {
        yield checkIsRegistered();
        yield messageSender.sendMessage(number, message, attachments);
    });

    /**
     * @method
     * @param {String} number - An E164 phone number
     */
    this.requestVerificationCode = co.wrap(function*(number) {
        yield checkIsUnregistered();
        return yield accountCreator.requestVerificationCode(number);
    });

    /**
     * @method
     * @param {String} number - An E164 phone number
     * @param {String} verificationCode
     */
    this.registerFirstDevice = co.wrap(function*(number, verificationCode) {
        yield checkIsUnregistered();
        localState = yield accountCreator.registerFirstDevice(number, verificationCode);
        initialisePostRegistration();
    });

    var axol = axolotl({
        getLocalIdentityKeyPair: () => localState.identityKeyPair,
        getLocalRegistrationId: () => localState.registrationId,
        getLocalSignedPreKeyPair: store.getLocalSignedPreKeyPair,
        getLocalPreKeyPair: store.getLocalPreKeyPair
    });
    var protocol = new Protocol("https://" + endpoint, axios);
    var accountCreator = new AccountCreator(store, axol, axolotlCrypto, protocol);

    var localState = null;

    var setupPromise = store.getLocalState().then((state) => {
        if (state) {
            localState = state;
            initialisePostRegistration();
        }
    });

    var authenticatedProtocol;
    var messageSender;
    var self = this;

    var initialisePostRegistration = () => {
        authenticatedProtocol = {
            getPreKeys: (number, device) => {
                return protocol.getPreKeys(localState.auth, number, device);
            },
            submitMessage: (number, messages) => {
                return protocol.submitMessage(localState.auth, number, messages);
            }
        };
        messageSender = new MessageSender(store, axol, authenticatedProtocol);

        var signalingCipher = new SignalingCipher(localState.signalingKey.cipher, localState.signalingKey.mac,
            axolotlCrypto);
        var messageReceiver = new MessageReceiver(store, axol, signalingCipher);
        messageReceiver.onpushmessagecontent = self.onmessage;
        messageReceiver.onreceipt = self.onreceipt;

        var wsUrl = "wss://" + endpoint + "/v1/websocket/?login=" +
            encodeURIComponent(localState.auth.number) + "." + encodeURIComponent(localState.auth.device) +
            "&password=" + encodeURIComponent(localState.auth.password);

        var webSocket = new WebSocket(wsUrl);
        var wrappedWebSocket = {
            send: webSocket.send.bind(webSocket)
        };
        webSocket.onmessage = (event) => {
            var reader = new FileReader();
            reader.onload = () => {
                wrappedWebSocket.onmessage(reader.result);
            };
            reader.readAsArrayBuffer(event.data);
        };

        var transport = new WebSocketPushTransport(wrappedWebSocket);
        transport.onmessage = messageReceiver.processIncomingMessageSignal;
    };

    var registered = () => {
        return !!localState;
    };
    var checkIsRegistered = co.wrap(function*() {
        yield setupPromise;
        if (!registered()) {
            throw new Error("This operation can only be done when the client is registered");
        }
    });

    var checkIsUnregistered = co.wrap(function*() {
        yield setupPromise;
        if (registered()) {
            throw new Error("This operation can only be done when the client is not registered");
        }
    });
}

export default TextSecure;
