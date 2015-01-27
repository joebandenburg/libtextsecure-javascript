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

import co from "co";
import {encode} from "./Base64";

function AccountCreator(store, axolotl, axolotlCrypto, protocol) {
    this.requestVerificationCode = (number) => protocol.requestVerificationCode("sms", number);

    this.registerFirstDevice = co.wrap(function*(number, verificationCode) {
        var identityKeyPair = yield axolotl.generateIdentityKeyPair();
        var localState = {
            registrationId: yield axolotl.generateRegistrationId(),
            identityKeyPair: identityKeyPair,
            auth: {
                number: number,
                device: 1,
                password: yield generatePassword()
            },
            signalingKey: {
                cipher: yield randomBytes(32),
                mac: yield randomBytes(20)
            }
        };
        yield protocol.createAccount(localState.auth, verificationCode, localState.signalingKey,
            localState.registrationId);
        yield store.putLocalState(localState);
        var preKeys = yield axolotl.generatePreKeys(0, 100);
        var lastResortPreKey = yield axolotl.generateLastResortPreKey();
        var signedPreKey = yield axolotl.generateSignedPreKey(identityKeyPair, 0);
        yield protocol.registerPreKeys(localState.auth, preKeys, lastResortPreKey, signedPreKey,
            identityKeyPair.public);
        yield preKeys.map((preKey) => store.putLocalPreKeyPair(preKey.id, preKey.keyPair));
        yield store.putLocalPreKeyPair(lastResortPreKey.id, lastResortPreKey.keyPair);
        yield store.putLocalSignedPreKeyPair(signedPreKey.id, signedPreKey.keyPair);
        return localState;
    });

    var randomBytes = (byteCount) => Promise.resolve(axolotlCrypto.randomBytes(byteCount));

    var generatePassword = co.wrap(function*() {
        var passwordBytes = yield randomBytes(16);
        return encode(passwordBytes, false);
    });
}

export default AccountCreator;
