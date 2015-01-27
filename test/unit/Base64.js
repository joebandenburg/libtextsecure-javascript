import chai from "chai";
import {encode, encodeStr, decode} from "../../src/Base64";

var assert = chai.assert;

describe("Base64", () => {
    describe("encode", () => {
        it("encodes byte array in base64", () => {
            var result = encode(new Uint8Array([77, 97, 110]).buffer);
            assert.equal(result, "TWFu");
        });
        it("pads by default", () => {
            var result = encode(new Uint8Array([77, 97, 110, 10]).buffer);
            assert.equal(result, "TWFuCg==");
        });
        it("doesn't pad if padding is fale", () => {
            var result = encode(new Uint8Array([77, 97, 110, 10]).buffer, false);
            assert.equal(result, "TWFuCg");
        });
    });
    describe("encodeStr", () => {
        it("encodes string in base64", () => {
            var result = encodeStr("Hello World!");
            assert.equal(result, "SGVsbG8gV29ybGQh");
        });
        it("assumes string is UTF-8", () => {
            var result = encodeStr("♡");
            assert.equal(result, "4pmh");
        });
        it("doesn't insert newlines after 75 characters", () => {
            var result = encodeStr("123456789012345678901234567890123456789012345678901234567890");
            assert.equal(result, "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkw");
        });
    });
    describe("decode", () => {
        it("decodes base64 string to byte array", () => {
            var result = decode("TWFu");
            assert.instanceOf(result, ArrayBuffer);
            assert.equal(result.byteLength, 3);
            var resultBytes = new Uint8Array(result);
            assert.equal(resultBytes[0], 77);
            assert.equal(resultBytes[1], 97);
            assert.equal(resultBytes[2], 110);
        });
        it("decodes base64 string with padding to byte array", () => {
            var result = decode("TWFuCg==");
            assert.instanceOf(result, ArrayBuffer);
            assert.equal(result.byteLength, 4);
            var resultBytes = new Uint8Array(result);
            assert.equal(resultBytes[0], 77);
            assert.equal(resultBytes[1], 97);
            assert.equal(resultBytes[2], 110);
            assert.equal(resultBytes[3], 10);
        });
        it("decodes base64 string without padding to byte array", () => {
            var result = decode("TWFuCg");
            assert.instanceOf(result, ArrayBuffer);
            assert.equal(result.byteLength, 4);
            var resultBytes = new Uint8Array(result);
            assert.equal(resultBytes[0], 77);
            assert.equal(resultBytes[1], 97);
            assert.equal(resultBytes[2], 110);
            assert.equal(resultBytes[3], 10);
        });
        it("throws an exception if the string is not a valid base64 string", () => {
            assert.throws(() => {
                decode("abcd\r\nhasdf");
            });
            assert.throws(() => {
                decode("abcd=hasdf");
            });
        });
    });
});
