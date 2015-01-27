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

import {
    NoSuchContactException,
    InvalidCredentialsException,
    MismatchedDevicesException,
    StaleDevicesException,
    BadlyFormattedMessageBodyException,
    IncorrectVerificationCodeException,
    NumberAlreadyRegisteredException
} from "./Exceptions";
import {encode, encodeStr, decode} from "./Base64";

var maxRetries = 5;

class RetryableException extends Error {
    constructor(otherException) {
        this.otherException = otherException;
    }
}

function Protocol(endpoint, http) {
    this.getPreKeys = (auth, number, device) => {
        device = device || "*";
        return request({
            url: "/v2/keys/" + number + "/" + device,
            method: "get",
            auth: auth
        }, {
            404: () => {
                throw new NoSuchContactException();
            }
        }).then((response) => {
            var preKeyResponse = response.data;
            preKeyResponse.identityKey = decode(preKeyResponse.identityKey);
            preKeyResponse.devices = preKeyResponse.devices.map((device) => {
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

    this.submitMessage = (auth, number, messages) => {
        return request({
            url: "/v1/messages/" + number,
            auth: auth,
            method: "put",
            data: {
                messages: messages.map((message) => {
                    // Even though the documentation says there should be no padding, it is required!
                    message.body = encode(message.body, true);
                    return message;
                })
            }
        }, {
            409: (response) => {
                throw new MismatchedDevicesException(response.data.missingDevices, response.data.extraDevices);
            },
            410: (response) => {
                throw new StaleDevicesException(response.data.staleDevices);
            }
        });
    };

    this.requestVerificationCode = (transport, number) => {
        return request({
            url: "/v1/accounts/" + transport + "/code/" + number,
            method: "get"
        });
    };

    this.createAccount = (auth, verificationCode, signalingKey, registrationId) => {
        var concatSignalingKey = new Uint8Array(52);
        concatSignalingKey.set(new Uint8Array(signalingKey.cipher), 0);
        concatSignalingKey.set(new Uint8Array(signalingKey.mac), 32);
        var signalingKeyString = encode(concatSignalingKey.buffer);
        return request({
            url: "/v1/accounts/code/" + verificationCode,
            auth: {
                // Don't include device id
                number: auth.number,
                password: auth.password
            },
            method: "put",
            data: {
                signalingKey: signalingKeyString,
                supportsSms: false,
                fetchesMessages: true,
                registrationId: registrationId
            }
        }, {
            403: () => {
                throw new IncorrectVerificationCodeException();
            },
            417: () => {
                throw new NumberAlreadyRegisteredException();
            }
        });
    };

    this.registerPreKeys = (auth, preKeys, lastResortPreKey, signedPreKey, identityPublicKey) => {
        return request({
            url: "/v2/keys",
            auth: auth,
            method: "put",
            data: {
                preKeys: preKeys.map((preKey) => {
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

    var request = (request, responseHandlers) => {
        if (request.auth) {
            request.headers = request.headers || {};
            request.headers.Authorization = constructAuthToken(request.auth);
            delete request.auth;
        }
        request.url = endpoint + request.url;
        responseHandlers = responseHandlers || {};
        responseHandlers[401] = () => {
            throw new InvalidCredentialsException();
        };
        responseHandlers[415] = () => {
            throw new BadlyFormattedMessageBodyException();
        };
        return withRetries(() => {
            return http(request).catch((response) => {
                if (!(response instanceof Error)) {
                    if (responseHandlers[response.status] !== undefined) {
                        return responseHandlers[response.status](response);
                    }
                }
                throw new RetryableException(response);
            });
        });
    };

    var constructAuthToken = (auth) => {
        var authString = auth.number;
        if (auth.device !== undefined) {
            authString += "." + auth.device;
        }
        authString += ":" + auth.password;
        return "Basic " + encodeStr(authString);
    };

    var withRetries = (requester) => {
        var retry = (requester, retriesLeft) => {
            return requester().catch((response) => {
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

export default Protocol;
