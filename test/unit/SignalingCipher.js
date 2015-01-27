import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import SignalingCipher from "../../src/SignalingCipher";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";

chai.use(chaiAsPromised);
var assert = chai.assert;

describe("SignalingCipher", () => {
    describe("decrypt", () => {
        var cipherKey = new Uint8Array([1, 2, 3]).buffer;
        var macKey = new Uint8Array([4, 5, 6]).buffer;
        var decryptionResult = new Uint8Array([3, 3, 3, 3]).buffer;
        var hmacResult = new Uint8Array([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]).buffer;
        var crypto;
        var ciphertext = new Uint8Array([
            // version
            1,
            // iv
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            // ciphertext
            2, 2, 2, 2,
            // mac
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6
        ]);
        var cipher;
        beforeEach(() => {
            crypto = {
                decrypt: sinon.stub().returns(Promise.resolve(decryptionResult)),
                hmac: sinon.stub().returns(Promise.resolve(hmacResult))
            };
            cipher = new SignalingCipher(cipherKey, macKey, crypto);
        });
        it("produces the correct decryption", () => {
            return cipher.decrypt(ciphertext.buffer).then((actualPlaintext) => {
                assert.ok(ArrayBufferUtils.areEqual(actualPlaintext, decryptionResult));
            });
        });
        it("passes the correct cipher key to decrypt", () => {
            return cipher.decrypt(ciphertext.buffer).then(() => {
                var args = crypto.decrypt.firstCall.args;
                assert.ok(ArrayBufferUtils.areEqual(args[0], cipherKey));
            });
        });
        it("passes the correct ciphertext to decrypt", () => {
            return cipher.decrypt(ciphertext.buffer).then(() => {
                var args = crypto.decrypt.firstCall.args;
                var expectedCiphertext = new Uint8Array([2, 2, 2, 2]).buffer;
                assert.ok(ArrayBufferUtils.areEqual(args[1], expectedCiphertext));
            });
        });
        it("passes the correct iv to decrypt", () => {
            return cipher.decrypt(ciphertext.buffer).then(() => {
                var args = crypto.decrypt.firstCall.args;
                var expectedIv = new Uint8Array([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]).buffer;
                assert.ok(ArrayBufferUtils.areEqual(args[2], expectedIv));
            });
        });
        it("passes the correct mac key to hmac", () => {
            return cipher.decrypt(ciphertext.buffer).then(() => {
                var args = crypto.hmac.firstCall.args;
                assert.ok(ArrayBufferUtils.areEqual(args[0], macKey));
            });
        });
        it("passes the correct message bytes to hmac", () => {
            return cipher.decrypt(ciphertext.buffer).then(() => {
                var args = crypto.hmac.firstCall.args;
                var expectedInput = new Uint8Array([
                    // version
                    1,
                    // iv
                    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                    // ciphertext
                    2, 2, 2, 2
                ]);
                assert.ok(ArrayBufferUtils.areEqual(args[1], expectedInput));
            });
        });
        it("rejects any version that is not 1", () => {
            ciphertext[0] = 2;
            return assert.isRejected(cipher.decrypt(ciphertext.buffer));
        });
        it("rejects invalid MAC", () => {
            ciphertext[0] = 2;
            return assert.isRejected(cipher.decrypt(ciphertext.buffer));
        });
        it("rejects a message that is too short", () => {
            var ciphertext = new Uint8Array([
                // version
                1,
                // iv
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                // mac
                6, 6, 6, 6, 6, 6, 6, 6, 6, 6
            ]);
            return assert.isRejected(cipher.decrypt(ciphertext.buffer));
        });
    });
});
