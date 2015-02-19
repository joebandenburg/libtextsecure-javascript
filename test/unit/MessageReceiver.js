import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import MessageReceiver from "../../src/MessageReceiver";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import IncomingPushMessageSignalProtos from "../../src/IncomingPushMessageSignalProtos";
import Contact from "../../src/Contact";

chai.use(chaiAsPromised);
var assert = chai.assert;

var IncomingPushMessageSignalProto = IncomingPushMessageSignalProtos.IncomingPushMessageSignal;

describe("MessageReceiver", () => {
    describe("processIncomingMessageSignal", () => {
        var store;
        var axolotl;
        var signalingCipher;
        var messageReceiver;
        var decryptionResult = {
            message: new Uint8Array([10, 3, 72, 105, 33, 0x80]).buffer,
            session: {
                data: 2
            },
            identityKey: new Uint8Array([0x11, 0x11, 0x11, 0x11]).buffer,
            registrationId: 9999
        };
        var message;
        beforeEach(() => {
            message = {
                type: IncomingPushMessageSignalProto.Type.PREKEY_BUNDLE,
                source: "+123",
                sourceDevice: 2,
                timestamp: 1234,
                message: new Uint8Array([1, 2, 3, 4]).buffer
            };
            store = {
                contacts: {},
                hasContact: (number) => Promise.resolve(!!store.contacts[number]),
                putContact: (number, contact) => Promise.resolve(store.contacts[number] = contact),
                getContact: (number) => Promise.resolve(store.contacts[number])
            };
            sinon.spy(store, "putContact");
            axolotl = {
                decryptPreKeyWhisperMessage: sinon.stub().returns(Promise.resolve(decryptionResult)),
                decryptWhisperMessage: sinon.stub().returns(Promise.resolve(decryptionResult))
            };
            signalingCipher = {
                decrypt: (ciphertext) => Promise.resolve(ciphertext)
            };
            sinon.spy(signalingCipher, "decrypt");
            messageReceiver = new MessageReceiver(store, axolotl, signalingCipher);
            messageReceiver.onpushmessagecontent = sinon.spy();
            messageReceiver.onreceipt = sinon.spy();
        });
        describe("new session", () => {
            it("calls onpushmessagecontent with the source number, timestamp and message body", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(messageReceiver.onpushmessagecontent);
                    var args = messageReceiver.onpushmessagecontent.firstCall.args;
                    assert.equal(args[0], "+123");
                    assert.equal(args[1], "Hi!");
                    assert.equal(args[2], 1234);
                });
            });
            it("calls signalingCipher.decrypt with the correct parameters", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(signalingCipher.decrypt);
                    var args = signalingCipher.decrypt.firstCall.args;
                    assert.ok(ArrayBufferUtils.areEqual(args[0], messageBytes));
                });
            });
            it("calls decryptPreKeyWhisperMessage with the correct parameters", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(axolotl.decryptPreKeyWhisperMessage);
                    var args = axolotl.decryptPreKeyWhisperMessage.firstCall.args;
                    assert.equal(args[0], null);
                    assert.ok(ArrayBufferUtils.areEqual(args[1], message.message));
                });
            });
            it("throws if type is CIPHERTEXT with no pre-existing session", () => {
                message.type = IncomingPushMessageSignalProto.Type.CIPHERTEXT;
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes));
            });
            it("creates a new contact", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    assert.equal(Object.keys(store.contacts).length, 1);
                    sinon.assert.calledOnce(store.putContact);
                    assert.equal(store.putContact.firstCall.args[0], "+123");
                    assert.deepEqual(store.putContact.firstCall.args[1], new Contact({
                        identityKey: null,
                        devices: [{
                            id: 2,
                            axolotlSession: decryptionResult.session,
                            registrationId: 9999
                        }]
                    }));
                });
            });
            it("rejects the promise if decryption fails", () => {
                axolotl.decryptPreKeyWhisperMessage.returns(Promise.reject());
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes));
            });
            it("doesn't create a new contact if decryption fails", () => {
                axolotl.decryptPreKeyWhisperMessage.returns(Promise.reject());
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes)).then(() => {
                    sinon.assert.notCalled(store.putContact);
                });
            });
            it("rejects an unknown message type", () => {
                var messageBytes = new IncomingPushMessageSignalProto({
                    type: IncomingPushMessageSignalProto.Type.UNKNOWN,
                    source: "+123",
                    sourceDevice: 2,
                    timestamp: 1234
                }).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes));
            });
            // TODO: Test change of identity key
        });
        describe("existing session", () => {
            var existingSession = {
                data: 3
            };
            beforeEach(() => {
                var contact = new Contact();
                contact.devices.push({
                    id: 2,
                    axolotlSession: existingSession
                });
                store.contacts["+123"] = contact;
                message.type = IncomingPushMessageSignalProto.Type.CIPHERTEXT;
            });
            it("loads pre-existing session", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(messageReceiver.onpushmessagecontent);
                    var args = messageReceiver.onpushmessagecontent.firstCall.args;
                    assert.equal(args[0], "+123");
                    assert.equal(args[1], "Hi!");
                    assert.equal(args[2], 1234);
                });
            });
            it("calls decryptWhisperMessage with the correct parameters", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(axolotl.decryptWhisperMessage);
                    var args = axolotl.decryptWhisperMessage.firstCall.args;
                    assert.equal(args[0], existingSession);
                    assert.ok(ArrayBufferUtils.areEqual(args[1], message.message));
                });
            });
            it("updates existing contact", () => {
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    assert.equal(Object.keys(store.contacts).length, 1);
                    sinon.assert.calledOnce(store.putContact);
                    assert.equal(store.putContact.firstCall.args[0], "+123");
                    assert.deepEqual(store.putContact.firstCall.args[1], new Contact({
                        identityKey: null,
                        devices: [{
                            id: 2,
                            axolotlSession: decryptionResult.session
                        }]
                    }));
                });
            });
            it("throws if session does not have a device with a matching id and message is CIPHERTEXT", () => {
                message.sourceDevice = 3;
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes));
            });
            it("adds a device if session does not have a device with a matching id", () => {
                message.sourceDevice = 3;
                message.type = IncomingPushMessageSignalProto.Type.PREKEY_BUNDLE;
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    assert.equal(Object.keys(store.contacts).length, 1);
                    sinon.assert.calledOnce(store.putContact);
                    assert.equal(store.putContact.firstCall.args[0], "+123");
                    assert.deepEqual(store.putContact.firstCall.args[1], new Contact({
                        identityKey: null,
                        devices: [{
                            id: 2,
                            axolotlSession: existingSession
                        }, {
                            id: 3,
                            axolotlSession: decryptionResult.session,
                            registrationId: 9999
                        }]
                    }));
                });
            });
            it("rejects the promise if decryption fails", () => {
                axolotl.decryptWhisperMessage.returns(Promise.reject());
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes));
            });
            it("doesn't create a new contact if decryption fails", () => {
                axolotl.decryptWhisperMessage.returns(Promise.reject());
                var messageBytes = new IncomingPushMessageSignalProto(message).encode().toArrayBuffer();
                return assert.isRejected(messageReceiver.processIncomingMessageSignal(messageBytes)).then(() => {
                    sinon.assert.notCalled(store.putContact);
                });
            });
            it("calls onreceipt when receiving a receipt", () => {
                axolotl.decryptPreKeyWhisperMessage.returns(Promise.reject());
                var messageBytes = new IncomingPushMessageSignalProto({
                    type: IncomingPushMessageSignalProto.Type.RECEIPT,
                    source: "+123",
                    sourceDevice: 2,
                    timestamp: 1234
                }).encode().toArrayBuffer();
                return messageReceiver.processIncomingMessageSignal(messageBytes).then(() => {
                    sinon.assert.calledOnce(messageReceiver.onreceipt);
                    var args = messageReceiver.onreceipt.firstCall.args;
                    assert.equal(args[0], "+123");
                    assert.equal(args[1], 1234);
                });
            });
        });
    });
});
