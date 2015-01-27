import chai from "chai";
import {padMessage, unpadMessage} from "../../src/MessagePadder";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";

var assert = chai.assert;

describe("MessagePadder", () => {
    describe("padMessage", () => {
        it("pads the empty message to the block size", () => {
            var message = new Uint8Array([]).buffer;
            var expected = new Uint8Array([
                0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = padMessage(message, 16);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("pads the message to the block size", () => {
            var message = new Uint8Array([
                1, 1, 1, 1
            ]).buffer;
            var expected = new Uint8Array([
                1, 1, 1, 1, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = padMessage(message, 16);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("pads a message two bytes shorter than the block size correctly", () => {
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0x80
            ]).buffer;
            var actual = padMessage(message, 16);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("pads a message one byte shorter than the block size correctly", () => {
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0x80,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = padMessage(message, 16);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("pads a message of the same length as the block size correctly", () => {
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = padMessage(message, 16);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
    });
    describe("unpadMessage", () => {
        it("unpads the empty message", () => {
            var expected = new Uint8Array([]).buffer;
            var message = new Uint8Array([
                0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = unpadMessage(message);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("unpads a message", () => {
            var expected = new Uint8Array([
                1, 1, 1, 1
            ]).buffer;
            var message = new Uint8Array([
                1, 1, 1, 1, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = unpadMessage(message);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("unpads a message two bytes shorter than the block size correctly", () => {
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0x80
            ]).buffer;
            var actual = unpadMessage(message);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("unpads a message one byte shorter than the block size correctly", () => {
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0x80,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = unpadMessage(message);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("unpads a message of the same length as the block size correctly", () => {
            var expected = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
            ]).buffer;
            var message = new Uint8Array([
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]).buffer;
            var actual = unpadMessage(message);
            assert.instanceOf(actual, ArrayBuffer);
            assert.equal(actual.byteLength, expected.byteLength);
            assert.ok(ArrayBufferUtils.areEqual(actual, expected));
        });
        it("throws if the padding is malformed", () => {
            var message = new Uint8Array([
                1, 1, 1, 1, 0x80, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0
            ]).buffer;
            assert.throws(() => {
                unpadMessage(message);
            });
        });
        it("throws if the message is not padded", () => {
            var message = new Uint8Array([
                1, 1, 1, 1
            ]).buffer;
            assert.throws(() => {
                unpadMessage(message);
            });
        });
    });
});
