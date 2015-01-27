import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import Protocol from "../../src/Protocol";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";
import {encodeStr, decode} from "../../src/Base64";
import axios from "axios";
import {
    NoSuchContactException,
    InvalidCredentialsException,
    MismatchedDevicesException,
    StaleDevicesException,
    BadlyFormattedMessageBodyException,
    IncorrectVerificationCodeException,
    NumberAlreadyRegisteredException
} from "../../src/Exceptions";

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("Protocol", () => {
    var protocol;
    var auth = {
        number: "+447000000002",
        device: 1,
        password: "password"
    };
    var expectedAuthorizationHeader = "Basic KzQ0NzAwMDAwMDAwMi4xOnBhc3N3b3Jk";
    var httpStub;
    beforeEach(() => {
        httpStub = sinon.stub().returns(Promise.resolve());
        protocol = new Protocol("endpoint", httpStub);
    });
    describe("getPreKeys", () => {
        var result;
        beforeEach(() => {
            result = {
                data: {
                    identityKey: "aaaa",
                    devices: [{
                        deviceId: "123",
                        registrationId: "4234",
                        signedPreKey: {
                            keyId: 111,
                            publicKey: "bbbb",
                            signature: "cccc"
                        },
                        preKey: {
                            keyId: 222,
                            publicKey: "dddd"
                        }
                    }]
                }
            };
            httpStub.returns(Promise.resolve(result));
        });
        it("sends a GET request to the correct URL", () => {
            protocol.getPreKeys(auth, "+447000000001");
            sinon.assert.calledOnce(httpStub);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v2/keys/+447000000001/*");
            assert.propertyVal(httpStub.firstCall.args[0], "method", "get");
        });
        it("passes the device number in the URL if one is passed", () => {
            protocol.getPreKeys(auth, "+447000000001", 234);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v2/keys/+447000000001/234");
        });
        it("sends the correct Authorization header", () => {
            protocol.getPreKeys(auth, "+447000000001");
            assert.deepPropertyVal(httpStub.firstCall.args[0], "headers.Authorization", expectedAuthorizationHeader);
        });
        it("doesn't resolve or reject the promise while the request is pending", () => {
            var resolved = sinon.spy();
            var rejected = sinon.spy();
            protocol.getPreKeys(auth, "+447000000001").then(resolved, rejected);
            sinon.assert.notCalled(resolved);
            sinon.assert.notCalled(rejected);
        });
        it("resolves the promise with the returned data", () => {
            return protocol.getPreKeys(auth, "+447000000001").then((response) => {
                var expectedIdentityKey = new Uint8Array([0x69, 0xA6, 0x9A]).buffer;
                assert.ok(ArrayBufferUtils.areEqual(response.identityKey, expectedIdentityKey));
                assert.equal(response.devices.length, 1);
                assert.strictEqual(response.devices[0].deviceId, 123);
                assert.strictEqual(response.devices[0].registrationId, 4234);
                assert.strictEqual(response.devices[0].signedPreKey.keyId, 111);
                assert.ok(ArrayBufferUtils.areEqual(response.devices[0].signedPreKey.publicKey, decode("bbbb")));
                assert.ok(ArrayBufferUtils.areEqual(response.devices[0].signedPreKey.signature, decode("cccc")));
                assert.strictEqual(response.devices[0].preKey.keyId, 222);
                assert.ok(ArrayBufferUtils.areEqual(response.devices[0].preKey.publicKey, decode("dddd")));
            });
        });
        it("rejects the promise with NoSuchContactException if server returns 404", () => {
            httpStub.returns(Promise.reject({
                status: 404
            }));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return assert.isRejected(promise, NoSuchContactException);
        });
        it("doesn't retry if the server returns 404", () => {
            httpStub.returns(Promise.reject({
                status: 404
            }));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
        it("retries if server returns 500", () => {
            httpStub.onCall(0).returns(Promise.reject({
                status: 500
            })).onCall(1).returns(Promise.resolve(result));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return promise.then((response) => {
                sinon.assert.calledTwice(httpStub);
                var expectedIdentityKey = new Uint8Array([0x69, 0xA6, 0x9A]).buffer;
                assert.ok(ArrayBufferUtils.areEqual(response.identityKey, expectedIdentityKey));
            });
        });
        it("gives up after 5 retries and returns the original error", () => {
            var response = {
                status: 500
            };
            httpStub.returns(Promise.reject(response));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return assert.isRejected(promise).then((actualResponse) => {
                sinon.assert.callCount(httpStub, 5);
                assert.equal(actualResponse, response);
            });
        });
        it("rejects the promise with InvalidCredentialsException if server returns 401", () => {
            httpStub.returns(Promise.reject({
                status: 401
            }));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return assert.isRejected(promise, InvalidCredentialsException);
        });
        it("doesn't retry if the server returns 401", () => {
            httpStub.returns(Promise.reject({
                status: 401
            }));
            var promise = protocol.getPreKeys(auth, "+447000000001");
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
    });
    describe("submitMessage", () => {
        it("sends a PUT request to the correct URL", () => {
            protocol.submitMessage(auth, "+447000000001", []);
            sinon.assert.calledOnce(httpStub);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v1/messages/+447000000001");
            assert.propertyVal(httpStub.firstCall.args[0], "method", "put");
        });
        it("sends a PUT request with the correct body", () => {
            var messages = [{
                body: decode("abc")
            }, {
                body: decode("efg")
            }];
            protocol.submitMessage(auth, "+447000000001", messages);
            assert.deepEqual(httpStub.firstCall.args[0].data, {
                messages: [{
                    body: "abc="
                }, {
                    body: "efg="
                }]
            });
        });
        it("sends the correct Authorization header", () => {
            protocol.submitMessage(auth, "+447000000001", []);
            assert.deepPropertyVal(httpStub.firstCall.args[0], "headers.Authorization", expectedAuthorizationHeader);
        });
        it("retries if server returns 500", () => {
            httpStub.onCall(0).returns(Promise.reject({
                status: 500
            })).onCall(1).returns(Promise.resolve());
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return promise.then(() => {
                sinon.assert.calledTwice(httpStub);
            });
        });
        it("gives up after 5 retries and returns the original error", () => {
            var response = {
                status: 500
            };
            httpStub.returns(Promise.reject(response));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then((actualResponse) => {
                sinon.assert.callCount(httpStub, 5);
                assert.equal(actualResponse, response);
            });
        });
        it("rejects the promise with InvalidCredentialsException if server returns 401", () => {
            httpStub.returns(Promise.reject({
                status: 401
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise, InvalidCredentialsException);
        });
        it("doesn't retry if the server returns 401", () => {
            httpStub.returns(Promise.reject({
                status: 401
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
        it("rejects the promise with MismatchedDevicesException if server returns 409", () => {
            var response = {
                missingDevices: [1, 2, 3],
                extraDevices: [4, 5]
            };
            httpStub.returns(Promise.reject({
                status: 409,
                data: response
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then((result) => {
                assert.instanceOf(result, MismatchedDevicesException);
                assert.deepEqual(result.missingDevices, response.missingDevices);
                assert.deepEqual(result.extraDevices, response.extraDevices);
            });
        });
        it("doesn't retry if the server returns 409", () => {
            httpStub.returns(Promise.reject({
                status: 409
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
        it("rejects the promise with StaleDevicesException if server returns 410", () => {
            var response = {
                staleDevices: [1, 2, 3]
            };
            httpStub.returns(Promise.reject({
                status: 410,
                data: response
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then((result) => {
                assert.instanceOf(result, StaleDevicesException);
                assert.deepEqual(result.staleDevices, response.staleDevices);
            });
        });
        it("doesn't retry if the server returns 410", () => {
            httpStub.returns(Promise.reject({
                status: 410
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
        it("retries if server returns 413", () => {
            httpStub.onCall(0).returns(Promise.reject({
                status: 413
            })).onCall(1).returns(Promise.resolve());
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return promise.then(() => {
                sinon.assert.calledTwice(httpStub);
            });
        });
        it("rejects the promise with BadlyFormattedMessageBodyException if server returns 415", () => {
            httpStub.returns(Promise.reject({
                status: 415
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise, BadlyFormattedMessageBodyException);
        });
        it("doesn't retry if the server returns 415", () => {
            httpStub.returns(Promise.reject({
                status: 415
            }));
            var promise = protocol.submitMessage(auth, "+447000000001", []);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
    });
    describe("requestVerificationCode", () => {
        it("sends a GET request to the correct URL", () => {
            protocol.requestVerificationCode("transport", "+447000000001");
            sinon.assert.calledOnce(httpStub);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v1/accounts/transport/code/+447000000001");
            assert.propertyVal(httpStub.firstCall.args[0], "method", "get");
        });
    });
    describe("createAccount", () => {
        var signalingKey = {
            cipher: new Uint8Array([
                0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
                0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
                0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
                0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11
            ]).buffer,
            mac: new Uint8Array([
                0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33,
                0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33,
                0x33, 0x33, 0x33, 0x33
            ]).buffer
        };
        it("sends a PUT request to the correct URL", () => {
            protocol.createAccount(auth, 123, signalingKey, 999);
            sinon.assert.calledOnce(httpStub);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v1/accounts/code/123");
            assert.propertyVal(httpStub.firstCall.args[0], "method", "put");
        });
        it("sends a request with the correct body", () => {
            protocol.createAccount(auth, 123, signalingKey, 999);
            assert.deepEqual(httpStub.firstCall.args[0].data, {
                signalingKey: "EREREREREREREREREREREREREREREREREREREREREREzMzMzMzMzMzMzMzMzMzMzMzMzMw==",
                supportsSms: false,
                fetchesMessages: true,
                registrationId: 999
            });
        });
        it("sends an Authorization header that does not include the device id", () => {
            var expectedAuthorizationHeader = "Basic " + encodeStr("+447000000002:password");
            protocol.createAccount(auth, 123, signalingKey, 999);
            assert.deepPropertyVal(httpStub.firstCall.args[0], "headers.Authorization", expectedAuthorizationHeader);
        });
        it("rejects the promise with IncorrectVerificationCodeException if server returns 403", () => {
            httpStub.returns(Promise.reject({
                status: 403
            }));
            var promise = protocol.createAccount(auth, 123, signalingKey, 999);
            return assert.isRejected(promise, IncorrectVerificationCodeException);
        });
        it("doesn't retry if the server returns 403", () => {
            httpStub.returns(Promise.reject({
                status: 403
            }));
            var promise = protocol.createAccount(auth, 123, signalingKey, 999);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
        it("rejects the promise with NumberAlreadyRegisteredException if server returns 417", () => {
            httpStub.returns(Promise.reject({
                status: 417
            }));
            var promise = protocol.createAccount(auth, 123, signalingKey, 999);
            return assert.isRejected(promise, NumberAlreadyRegisteredException);
        });
        it("doesn't retry if the server returns 417", () => {
            httpStub.returns(Promise.reject({
                status: 417
            }));
            var promise = protocol.createAccount(auth, 123, signalingKey, 999);
            return assert.isRejected(promise).then(() => {
                sinon.assert.calledOnce(httpStub);
            });
        });
    });
    describe("registerPreKeys", () => {
        var fourByteBuffer = (bytesValue) => {
            return new Uint8Array([bytesValue, bytesValue, bytesValue, bytesValue]).buffer;
        };
        var preKeys = [{
            id: 1,
            keyPair: {
                public: fourByteBuffer(0x11),
                private: fourByteBuffer(0x22)
            }
        }, {
            id: 2,
            keyPair: {
                public: fourByteBuffer(0x33),
                private: fourByteBuffer(0x44)
            }
        }];
        var lastResortPreKey = {
            id: 0xFFFFFF,
            keyPair: {
                public: fourByteBuffer(0x55),
                private: fourByteBuffer(0x66)
            }
        };
        var signedPreKey = {
            id: 1,
            keyPair: {
                public: fourByteBuffer(0x77),
                private: fourByteBuffer(0x88)
            },
            signature: fourByteBuffer(0x99)
        };
        var idneitityPublicKey = fourByteBuffer(0xaa);
        it("sends a PUT request to the correct URL", () => {
            protocol.registerPreKeys(auth, preKeys, lastResortPreKey, signedPreKey, idneitityPublicKey);
            sinon.assert.calledOnce(httpStub);
            assert.propertyVal(httpStub.firstCall.args[0], "url", "endpoint/v2/keys");
            assert.propertyVal(httpStub.firstCall.args[0], "method", "put");
        });
        it("sends a request with the correct body", () => {
            protocol.registerPreKeys(auth, preKeys, lastResortPreKey, signedPreKey, idneitityPublicKey);
            assert.deepEqual(httpStub.firstCall.args[0].data, {
                identityKey: "qqqqqg",
                preKeys: [{
                    keyId: 1,
                    publicKey: "EREREQ"
                }, {
                    keyId: 2,
                    publicKey: "MzMzMw"
                }],
                lastResortKey: {
                    keyId: 0xFFFFFF,
                    publicKey: "VVVVVQ"
                },
                signedPreKey: {
                    keyId: 1,
                    publicKey: "d3d3dw",
                    signature: "mZmZmQ"
                }
            });
        });
        it("sends the correct Authorization header", () => {
            protocol.registerPreKeys(auth, preKeys, lastResortPreKey, signedPreKey, idneitityPublicKey);
            assert.deepPropertyVal(httpStub.firstCall.args[0], "headers.Authorization", expectedAuthorizationHeader);
        });
    });
});
