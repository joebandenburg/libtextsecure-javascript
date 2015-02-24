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
import AutoReconnectingWebSocket from "./AutoReconnectingWebSocket";

import axolotl from "axolotl";
import axolotlCrypto from "axolotl-crypto";
import axios from "axios";
import co from "co";

function TextSecure(store, serverEndpointHost, webSocketFactory, options) {
    this.onmessage = () => {};
    this.onreceipt = () => {};

    /**
     * @method
     * @param {String} number - An E164 phone number
     */
    this.sendMessage = co.wrap(function*(number, message, timestamp, attachments) {
        yield checkIsRegistered();
        yield messageSender.sendMessage(number, message, timestamp, attachments);
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

    options = Object.assign({}, {
        httpUseTls: true,
        webSocketUseTls: true,
        initialPreKeyGenerationCount: 100
    }, options);

    var axol = axolotl({
        getLocalIdentityKeyPair: () => localState.identityKeyPair,
        getLocalRegistrationId: () => localState.registrationId,
        getLocalSignedPreKeyPair: store.getLocalSignedPreKeyPair.bind(store),
        getLocalPreKeyPair: store.getLocalPreKeyPair.bind(store)
    });
    var httpEndpoint = (options.httpUseTls ? "https" : "http") + "://" + serverEndpointHost;
    var protocol = new Protocol(httpEndpoint, axios);
    var accountCreator = new AccountCreator(store, axol, axolotlCrypto, protocol, options.initialPreKeyGenerationCount);

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
        messageReceiver.onpushmessagecontent = function() {
            self.onmessage.apply(self, arguments);
        };
        messageReceiver.onreceipt = function() {
            self.onreceipt.apply(self, arguments);
        };

        var wsEndpoint = (options.webSocketUseTls ? "wss" : "ws") + "://" + serverEndpointHost;
        var wsUrl = wsEndpoint + "/v1/websocket/?login=" +
            encodeURIComponent(localState.auth.number) + "." + encodeURIComponent(localState.auth.device) +
            "&password=" + encodeURIComponent(localState.auth.password);

        var webSocket = new AutoReconnectingWebSocket(webSocketFactory, wsUrl);
        var transport = new WebSocketPushTransport(webSocket);
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
