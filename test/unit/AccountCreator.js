import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import AccountCreator from "../../src/AccountCreator";

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("AccountCreator", () => {
    describe("requestVerificationCode", () => {
        it("calls protocol requestVerificationCode with the correct arguments", () => {
            var protocol = {
                requestVerificationCode: sinon.stub().returns(Promise.resolve(222))
            };
            var accountCreator = new AccountCreator(null, null, null, protocol);
            return accountCreator.requestVerificationCode("+123").then((result) => {
                sinon.assert.calledOnce(protocol.requestVerificationCode);
                sinon.assert.calledWith(protocol.requestVerificationCode, "sms", "+123");
                assert.equal(result, 222);
            });
        });
    });
    describe("registerFirstDevice", () => {
        var store;
        var axolotl;
        var axolotlCrypto;
        var protocol;
        var accountCreator;
        beforeEach(() => {
            store = {
                putLocalPreKeyPair: sinon.stub().returns(Promise.resolve()),
                putLocalSignedPreKeyPair: sinon.stub().returns(Promise.resolve()),
                putLocalState: sinon.stub().returns(Promise.resolve())
            };
            axolotl = {
                generateIdentityKeyPair: sinon.stub().returns(Promise.resolve({
                    public: 1,
                    private: 10
                })),
                generateRegistrationId: sinon.stub().returns(Promise.resolve(2)),
                generateLastResortPreKey: sinon.stub().returns(Promise.resolve({
                    id: 1000,
                    keyPair: {
                        public: 1001,
                        private: 1002
                    }
                })),
                generateSignedPreKey: sinon.stub().returns(Promise.resolve({
                    id: 0,
                    keyPair: {
                        public: 20,
                        private: 21
                    }
                })),
                generatePreKeys: sinon.stub().returns(Promise.resolve([{
                    id: 0,
                    keyPair: {
                        public: 80,
                        private: 81
                    }
                }, {
                    id: 1,
                    keyPair: {
                        public: 90,
                        private: 91
                    }
                }]))
            };
            axolotlCrypto = {
                randomBytes: (bytes) => {
                    return new ArrayBuffer(bytes);
                }
            };
            sinon.spy(axolotlCrypto, "randomBytes");
            protocol = {
                createAccount: sinon.stub().returns(Promise.resolve()),
                registerPreKeys: sinon.stub().returns(Promise.resolve())
            };
            accountCreator = new AccountCreator(store, axolotl, axolotlCrypto, protocol);
        });
        it("returns the correct local state", () => {
            return accountCreator.registerFirstDevice("+123", "999").then((localState) => {
                assert.deepEqual(localState.identityKeyPair, {
                    public: 1,
                    private: 10
                });
                assert.propertyVal(localState, "registrationId", 2);
                assert.deepPropertyVal(localState, "auth.number", "+123");
                assert.deepPropertyVal(localState, "auth.device", 1);
                assert.deepPropertyVal(localState, "auth.password", "AAAAAAAAAAAAAAAAAAAAAA");
                assert.ok(ArrayBufferUtils.areEqual(localState.signalingKey.cipher, new ArrayBuffer(32)));
                assert.ok(ArrayBufferUtils.areEqual(localState.signalingKey.mac, new ArrayBuffer(20)));
            });
        });
        it("creates the account with the correct parameters", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledOnce(protocol.createAccount);
                var args = protocol.createAccount.firstCall.args;
                assert.deepEqual(args[0], {
                    number: "+123",
                    device: 1,
                    password: "AAAAAAAAAAAAAAAAAAAAAA"
                });
                assert.equal(args[1], "999");
                assert.ok(ArrayBufferUtils.areEqual(args[2].cipher, new ArrayBuffer(32)));
                assert.ok(ArrayBufferUtils.areEqual(args[2].mac, new ArrayBuffer(20)));
            });
        });
        it("passes the correct parameters to registerPreKeys", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledOnce(protocol.registerPreKeys);
                var args = protocol.registerPreKeys.firstCall.args;
                assert.deepEqual(args[0], {
                    number: "+123",
                    device: 1,
                    password: "AAAAAAAAAAAAAAAAAAAAAA"
                });
                assert.deepEqual(args[1], [{
                    id: 0,
                    keyPair: {
                        public: 80,
                        private: 81
                    }
                }, {
                    id: 1,
                    keyPair: {
                        public: 90,
                        private: 91
                    }
                }]);
                assert.deepEqual(args[2], {
                    id: 1000,
                    keyPair: {
                        public: 1001,
                        private: 1002
                    }
                });
                assert.deepEqual(args[3], {
                    id: 0,
                    keyPair: {
                        public: 20,
                        private: 21
                    }
                });
                assert.equal(args[4], 1);
            });
        });
        it("generates 100 pre keys starting at 0", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledOnce(axolotl.generatePreKeys);
                sinon.assert.calledWith(axolotl.generatePreKeys, 0, 100);
            });
        });
        it("stores the generated pre keys and last resort pre key", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledThrice(store.putLocalPreKeyPair);
                assert.deepEqual(store.putLocalPreKeyPair.firstCall.args, [0, {
                    public: 80,
                    private: 81
                }]);
                assert.deepEqual(store.putLocalPreKeyPair.secondCall.args, [1, {
                    public: 90,
                    private: 91
                }]);
                assert.deepEqual(store.putLocalPreKeyPair.thirdCall.args, [1000, {
                    public: 1001,
                    private: 1002
                }]);
            });
        });
        it("stores the generated signed pre key", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledOnce(store.putLocalSignedPreKeyPair);
                assert.deepEqual(store.putLocalSignedPreKeyPair.firstCall.args, [0, {
                    public: 20,
                    private: 21
                }]);
            });
        });
        it("stores the local state", () => {
            return accountCreator.registerFirstDevice("+123", "999").then(() => {
                sinon.assert.calledOnce(store.putLocalState);
                var localState = store.putLocalState.firstCall.args[0];
                assert.deepEqual(localState.identityKeyPair, {
                    public: 1,
                    private: 10
                });
                assert.propertyVal(localState, "registrationId", 2);
                assert.deepPropertyVal(localState, "auth.number", "+123");
                assert.deepPropertyVal(localState, "auth.device", 1);
                assert.deepPropertyVal(localState, "auth.password", "AAAAAAAAAAAAAAAAAAAAAA");
                assert.ok(ArrayBufferUtils.areEqual(localState.signalingKey.cipher, new ArrayBuffer(32)));
                assert.ok(ArrayBufferUtils.areEqual(localState.signalingKey.mac, new ArrayBuffer(20)));
            });
        });
        it("rejects if createAccount rejects", () => {
            protocol.createAccount.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999"));
        });
        it("doesn't store the local state if createAccount rejects", () => {
            protocol.createAccount.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999")).then(() => {
                sinon.assert.notCalled(store.putLocalState);
            });
        });
        it("doesn't store the key pairs if createAccount rejects", () => {
            protocol.createAccount.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999")).then(() => {
                sinon.assert.notCalled(store.putLocalPreKeyPair);
                sinon.assert.notCalled(store.putLocalSignedPreKeyPair);
            });
        });
        it("rejects if registerPreKeys rejects", () => {
            protocol.registerPreKeys.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999"));
        });
        it("doesn't store the key pairs if registerPreKeys rejects", () => {
            protocol.registerPreKeys.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999")).then(() => {
                sinon.assert.notCalled(store.putLocalPreKeyPair);
                sinon.assert.notCalled(store.putLocalSignedPreKeyPair);
            });
        });
        it("stores the local state even if registerPreKeys rejects", () => {
            protocol.registerPreKeys.returns(Promise.reject());
            return assert.isRejected(accountCreator.registerFirstDevice("+123", "999")).then(() => {
                sinon.assert.calledOnce(store.putLocalState);
            });
        });
    });
});
