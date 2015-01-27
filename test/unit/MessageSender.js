import chai from "chai";
import sinon from "sinon";
import co from "co";

import MessageSender from "../../src/MessageSender";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import {decode} from "../../src/Base64";
import {MismatchedDevicesException, StaleDevicesException} from "../../src/Exceptions";

var assert = chai.assert;

describe("MessageSender", () => {
    describe("sendMessage", () => {
        var store;
        var axolotl;
        var protocol;
        var device1 = {
            deviceId: 1234,
            registrationId: 5678,
            preKey: {
                keyId: 10,
                publicKey: decode("efgh")
            },
            signedPreKey: {
                keyId: 11,
                publicKey: decode("ijkl"),
                signature: decode("mnop")
            }
        };
        var device2 = {
            deviceId: 888,
            registrationId: 999,
            preKey: {
                keyId: 88,
                publicKey: decode("spam")
            },
            signedPreKey: {
                keyId: 99,
                publicKey: decode("cram"),
                signature: decode("damn")
            }
        };
        var preKeys;
        var axolotlSession = {};
        var encryptedMessage = {
            isPreKeyWhisperMessage: true,
            body: new Uint8Array([1, 2, 3, 4]).buffer,
            session: {}
        };
        var messageSender;
        var sandbox;
        beforeEach(() => {
            preKeys = {
                identityKey: decode("abcd"),
                devices: [device1]
            };
            store = {
                contacts: {},
                hasContact: (number) => Promise.resolve(!!store.contacts[number]),
                putContact: (number, contact) => Promise.resolve(store.contacts[number] = contact),
                getContact: (number) => Promise.resolve(store.contacts[number])
            };
            sinon.spy(store, "putContact");
            protocol = {
                getPreKeys: sinon.stub().returns(Promise.resolve(preKeys)),
                submitMessage: sinon.stub().returns(Promise.resolve())
            };
            axolotl = {
                createSessionFromPreKeyBundle: sinon.stub().returns(Promise.resolve(axolotlSession)),
                encryptMessage: sinon.stub().returns(Promise.resolve(encryptedMessage))
            };
            sandbox = sinon.sandbox.create();
            messageSender = new MessageSender(store, axolotl, protocol);
        });
        afterEach(() => {
            sandbox.restore();
        });
        it("submits a message to the correct number", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            sinon.assert.calledOnce(protocol.submitMessage);
            var args = protocol.submitMessage.firstCall.args;
            assert.equal(args[0], "+447000000001");
        }));
        it("uses the correct device id", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var args = protocol.submitMessage.firstCall.args;
            assert.equal(args[1][0].destinationDeviceId, 1234);
        }));
        it("uses the correct registration id", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var args = protocol.submitMessage.firstCall.args;
            assert.equal(args[1][0].destinationRegistrationId, 5678);
        }));
        it("sends a pre key whisper message (type 3) if the contact didn't previously exist", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var args = protocol.submitMessage.firstCall.args;
            assert.equal(args[1][0].type, 3);
        }));
        it("uses the correct body", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var args = protocol.submitMessage.firstCall.args;
            assert.ok(ArrayBufferUtils.areEqual(args[1][0].body, new Uint8Array([1, 2, 3, 4]).buffer));
        }));
        it("requests pre keys for contact if the contact didn't previously exist", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            sinon.assert.calledOnce(protocol.getPreKeys);
            sinon.assert.calledWith(protocol.getPreKeys, "+447000000001");
        }));
        it("creates a contact if it didn't previously exist", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            assert.equal(Object.keys(store.contacts).length, 1);
            var contact = store.contacts["+447000000001"];
            assert.ok(ArrayBufferUtils.areEqual(contact.identityKey, decode("abcd")));
            assert.equal(contact.devices.length, 1);
            assert.equal(contact.devices[0].id, 1234);
            assert.equal(contact.devices[0].registrationId, 5678);
            assert.equal(contact.devices[0].signedPreKey.id, 11);
            assert.equal(contact.devices[0].axolotlSession, encryptedMessage.session);
            assert.ok(ArrayBufferUtils.areEqual(contact.devices[0].signedPreKey.publicKey, decode("ijkl")));
            assert.ok(ArrayBufferUtils.areEqual(contact.devices[0].signedPreKey.signature, decode("mnop")));
        }));
        it("setups up an axolotl session for each device", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            sinon.assert.calledOnce(axolotl.createSessionFromPreKeyBundle);
            var args = axolotl.createSessionFromPreKeyBundle.firstCall.args[0];
            assert.ok(ArrayBufferUtils.areEqual(args.identityKey, decode("abcd")));
            assert.equal(args.preKeyId, 10);
            assert.ok(ArrayBufferUtils.areEqual(args.preKey, decode("efgh")));
            assert.equal(args.signedPreKeyId, 11);
            assert.ok(ArrayBufferUtils.areEqual(args.signedPreKey, decode("ijkl")));
            assert.ok(ArrayBufferUtils.areEqual(args.signedPreKeySignature, decode("mnop")));
        }));
        it("encrypts the message using the correct axoltol session", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            sinon.assert.calledOnce(axolotl.encryptMessage);
            var args = axolotl.encryptMessage.firstCall.args;
            assert.equal(args[0], axolotlSession);
        }));
        it("encrypts the correct message", co.wrap(function*() {
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            sinon.assert.calledOnce(axolotl.encryptMessage);
            var args = axolotl.encryptMessage.firstCall.args;
            var expectedMessage = new Uint8Array([
                // body field
                0x0a, 0x0c, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20,
                0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21,
                                                    // padding
                                                    0x80, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]).buffer;
            assert.ok(ArrayBufferUtils.areEqual(args[1], expectedMessage));
        }));
        it("send a message for every device", co.wrap(function*() {
            preKeys.devices.push(device2);
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var messages = protocol.submitMessage.firstCall.args[1];
            assert.equal(messages.length, 2);
        }));
        it("uses the same timestamp for every device", co.wrap(function*() {
            sandbox.stub(Date, "now", () => Math.random());
            preKeys.devices.push(device2);
            yield messageSender.sendMessage("+447000000001", "Hello world!");
            var messages = protocol.submitMessage.firstCall.args[1];
            assert.equal(messages[0].timestamp, messages[1].timestamp);
        }));
        it("rejects if protoocl.submitMessage rejects", () => {
            protocol.submitMessage.onFirstCall().returns(Promise.reject());
            return assert.isRejected(messageSender.sendMessage("+447000000001", "Hello world!"));
        });
        describe("existing contact", () => {
            beforeEach(() => {
                store.contacts["+447000000001"] = {
                    identityKey: decode("spam"),
                    devices: [{
                        id: 1000,
                        signedPreKey: {
                            id: 1001,
                            publicKey: decode("pram"),
                            signature: decode("sign")
                        },
                        axolotlSession: {}
                    }, {
                        id: 2000,
                        signedPreKey: {
                            id: 2001,
                            publicKey: decode("pram"),
                            signature: decode("sign")
                        },
                        axolotlSession: {}
                    }]
                };
            });
            it("doesn't call prekeys if the contact already exists", co.wrap(function*() {
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                sinon.assert.notCalled(protocol.getPreKeys);
            }));
            it("retries if protocol.submitMessage rejects with StaleDevicesException", co.wrap(function*() {
                var expection = new StaleDevicesException([1000]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                sinon.assert.calledTwice(protocol.submitMessage);
            }));
            it("gives up after 5 retries if protocol always rejects with StaleDevicesException", () => {
                var expection = new StaleDevicesException([1000]);
                protocol.submitMessage.returns(Promise.reject(expection));
                return assert.isRejected(messageSender.sendMessage("+447000000001", "Hello world!")).then(() => {
                    sinon.assert.callCount(protocol.submitMessage, 5);
                });
            });
            it("updates the existing contact", co.wrap(function*() {
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                sinon.assert.calledOnce(store.putContact);
                assert.equal(store.contacts["+447000000001"].devices[0].axolotlSession, encryptedMessage.session);
            }));
            it("removes stale devices", co.wrap(function*() {
                var expection = new StaleDevicesException([1000]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(store.contacts["+447000000001"].devices.length, 1);
                assert.equal(store.contacts["+447000000001"].devices[0].id, 2000);
            }));
            it("doesn't resend messages to stale devices", co.wrap(function*() {
                var expection = new StaleDevicesException([1000]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(protocol.submitMessage.secondCall.args[1].length, 1);
            }));
            it("ignores unrecognised stale devices", co.wrap(function*() {
                var expection = new StaleDevicesException([777]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(protocol.submitMessage.secondCall.args[1].length, 2);
            }));
            it("retries if protocol.submitMessage rejects with MismatchedDevicesException", co.wrap(function*() {
                var expection = new MismatchedDevicesException([1234], []);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                sinon.assert.calledTwice(protocol.submitMessage);
            }));
            it("removes extra devices", co.wrap(function*() {
                var expection = new MismatchedDevicesException([], [1000]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(store.contacts["+447000000001"].devices.length, 1);
                assert.equal(store.contacts["+447000000001"].devices[0].id, 2000);
            }));
            it("ignores unrecognised extra devices", co.wrap(function*() {
                var expection = new MismatchedDevicesException([], [777]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(protocol.submitMessage.secondCall.args[1].length, 2);
            }));
            it("doesn't resend messages to extra devices", co.wrap(function*() {
                var expection = new MismatchedDevicesException([], [1000]);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(protocol.submitMessage.secondCall.args[1].length, 1);
            }));
            it("adds missing devices", co.wrap(function*() {
                protocol.getPreKeys.onFirstCall().returns(Promise.resolve({
                    identityKey: decode("abcd"),
                    devices: [device1]
                })).onSecondCall().returns(Promise.resolve({
                    identityKey: decode("abcd"),
                    devices: [device2]
                }));
                var expection = new MismatchedDevicesException([1234, 888], []);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(store.contacts["+447000000001"].devices.length, 4);
                assert.equal(store.contacts["+447000000001"].devices[2].id, 1234);
                assert.equal(store.contacts["+447000000001"].devices[3].id, 888);
                sinon.assert.calledTwice(protocol.getPreKeys);
                assert.deepEqual(protocol.getPreKeys.firstCall.args, ["+447000000001", 1234]);
                assert.deepEqual(protocol.getPreKeys.secondCall.args, ["+447000000001", 888]);
            }));
            it("resend messages to missing devices", co.wrap(function*() {
                var expection = new MismatchedDevicesException([1234, 888], []);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                yield messageSender.sendMessage("+447000000001", "Hello world!");
                assert.equal(protocol.submitMessage.secondCall.args[1].length, 4);
            }));
            it("rejects if missing devices are not found", () => {
                protocol.getPreKeys.onFirstCall().returns(Promise.reject());
                var expection = new MismatchedDevicesException([1234], []);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                return assert.isRejected(messageSender.sendMessage("+447000000001", "Hello world!"));
            });
            it("doesn't retry if if missing devices are not found", () => {
                protocol.getPreKeys.onFirstCall().returns(Promise.reject());
                var expection = new MismatchedDevicesException([1234], []);
                protocol.submitMessage.onFirstCall().returns(Promise.reject(expection));
                return assert.isRejected(messageSender.sendMessage("+447000000001", "Hello world!")).then(() => {
                    sinon.assert.calledOnce(protocol.submitMessage);
                });
            });
        });
        // TODO: Test change of identity key when requesting pre keys
    });
});
