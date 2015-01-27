import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import WebSocketPushTransport from "../../src/WebSocketPushTransport";
import WebSocketProtocolProtos from "../../src/WebSocketProtocolProtos";
import ArrayBufferUtils from "../../src/ArrayBufferUtils";

var WebSocketMessage = WebSocketProtocolProtos.WebSocketMessage;

var assert = chai.assert;

describe("WebSocketPushTransport", () => {
    var clock;
    var socket;
    var transport;
    beforeEach(() => {
        clock = sinon.useFakeTimers();
        socket = {
            send: sinon.spy()
        };
        transport = new WebSocketPushTransport(socket);
        transport.onmessage = sinon.spy();
    });
    afterEach(() => {
        clock.restore();
    });
    describe("onmessage", () => {
        it("calls onmessage with the body of the message", () => {
            var data = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "PUT",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();
            return socket.onmessage(data).then(() => {
                sinon.assert.calledOnce(transport.onmessage);
                assert.ok(ArrayBufferUtils.areEqual(transport.onmessage.firstCall.args[0],
                    new Uint8Array([1, 2, 3]).buffer));
            });
        });
        it("ignores if the verb and path combination is not recognised", () => {
            var data1 = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "GET",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();

            var data2 = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "PUT",
                    path: "/messages",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();

            return Promise.all([
                socket.onmessage(data1),
                socket.onmessage(data2)
            ]).then(() => {
                sinon.assert.notCalled(transport.onmessage);
            });
        });
        it("ignores if the verb and path combination is not recognised", () => {
            var data1 = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "GET",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();

            var data2 = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "PUT",
                    path: "/messages",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();

            return Promise.all([
                socket.onmessage(data1),
                socket.onmessage(data2)
            ]).then(() => {
                sinon.assert.notCalled(transport.onmessage);
            });
        });
        it("ignores responses", () => {
            var data = new WebSocketMessage({
                type: WebSocketMessage.Type.RESPONSE
            }).encode().toArrayBuffer();
            return socket.onmessage(data).then(() => {
                sinon.assert.notCalled(transport.onmessage);
            });
        });
        it("sends response after receiving message", () => {
            var data = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    id: 88,
                    verb: "PUT",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();
            return socket.onmessage(data).then(() => {
                sinon.assert.calledOnce(socket.send);
                var responseBytes = socket.send.firstCall.args[0];
                assert.instanceOf(responseBytes, ArrayBuffer);
                var response = WebSocketMessage.decode(responseBytes).toRaw();
                assert.deepEqual(response, {
                    type: WebSocketMessage.Type.RESPONSE,
                    request: null,
                    response: {
                        id: {
                            high: 0,
                            low: 88,
                            unsigned: true
                        },
                        status: 200,
                        message: "OK",
                        body: null
                    }
                });
            });
        });
        it("sends 500 response if onmessage handler rejects", () => {
            var data = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    id: 88,
                    verb: "PUT",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();
            transport.onmessage = sinon.stub().returns(Promise.reject());
            return socket.onmessage(data).then(() => {
                sinon.assert.calledOnce(socket.send);
                var responseBytes = socket.send.firstCall.args[0];
                assert.instanceOf(responseBytes, ArrayBuffer);
                var response = WebSocketMessage.decode(responseBytes).toRaw();
                assert.deepEqual(response, {
                    type: WebSocketMessage.Type.RESPONSE,
                    request: null,
                    response: {
                        id: {
                            high: 0,
                            low: 88,
                            unsigned: true
                        },
                        status: 500,
                        message: "",
                        body: null
                    }
                });
            });
        });
        it("sends 500 response if the verb and path combination is not recognised", () => {
            var data = new WebSocketMessage({
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    id: 88,
                    verb: "GET",
                    path: "/api/v1/message",
                    body: new Uint8Array([1, 2, 3]).buffer
                }
            }).encode().toArrayBuffer();
            return socket.onmessage(data).then(() => {
                sinon.assert.calledOnce(socket.send);
                var responseBytes = socket.send.firstCall.args[0];
                assert.instanceOf(responseBytes, ArrayBuffer);
                var response = WebSocketMessage.decode(responseBytes).toRaw();
                assert.deepEqual(response, {
                    type: WebSocketMessage.Type.RESPONSE,
                    request: null,
                    response: {
                        id: {
                            high: 0,
                            low: 88,
                            unsigned: true
                        },
                        status: 500,
                        message: "",
                        body: null
                    }
                });
            });
        });
    });
    describe("keep alive", () => {
        it("sends a keep alive message after 15 seocnds", () => {
            clock.tick(15000);
            sinon.assert.calledOnce(socket.send);
            var messageBytes = socket.send.firstCall.args[0];
            assert.instanceOf(messageBytes, ArrayBuffer);
            var message = WebSocketMessage.decode(messageBytes).toRaw();
            assert.deepEqual(message, {
                type: WebSocketMessage.Type.REQUEST,
                request: {
                    verb: "GET",
                    path: "/v1/keepalive",
                    body: null,
                    id: null
                },
                response: null
            });
        });
        it("continues to send keep alive messages every 15 seconds", () => {
            clock.tick(45000);
            sinon.assert.calledThrice(socket.send);
        });
    });
});
