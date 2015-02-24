import sinon from "sinon";

import AutoReconnectingWebSocket from "../../src/AutoReconnectingWebSocket";

describe("AutoReconnectingWebSocket", () => {
    var clock;
    var webSocket;
    var webSocketFactory;
    beforeEach(() => {
        clock = sinon.useFakeTimers(100000);
        webSocket = {
            send: sinon.stub()
        };
        webSocketFactory = {
            connect: sinon.stub().returns(webSocket)
        };
    });
    afterEach(() => {
        clock.restore();
    });
    it("opens a web socket connection immediately", () => {
        new AutoReconnectingWebSocket(webSocketFactory, "url");
        sinon.assert.calledOnce(webSocketFactory.connect);
        sinon.assert.calledWithExactly(webSocketFactory.connect, "url");
    });
    describe("reconnect", () => {
        it("reconnects immediately if web socket closes after throttle period", () => {
            new AutoReconnectingWebSocket(webSocketFactory, "url");
            clock.tick(10000);
            webSocket.onclose();
            sinon.assert.calledTwice(webSocketFactory.connect);
        });
        it("doesn't reconnect if web socket closes immediately", () => {
            new AutoReconnectingWebSocket(webSocketFactory, "url");
            webSocket.onclose();
            sinon.assert.calledOnce(webSocketFactory.connect);
        });
        it("reconnects after throttle period if web socket closes immediately", () => {
            new AutoReconnectingWebSocket(webSocketFactory, "url");
            webSocket.onclose();
            clock.tick(10000);
            sinon.assert.calledTwice(webSocketFactory.connect);
        });
        it("waits 5 seconds before attempting to reconnect again", () => {
            new AutoReconnectingWebSocket(webSocketFactory, "url");
            webSocket.onclose();
            clock.tick(5000 - 1);
            sinon.assert.calledOnce(webSocketFactory.connect);
            clock.tick(1);
            sinon.assert.calledTwice(webSocketFactory.connect);
        });
    });
    describe("send", () => {
        it("calls the send on the underlying web socket", () => {
            var ws = new AutoReconnectingWebSocket(webSocketFactory, "url");
            ws.send("foo");
            sinon.assert.calledOnce(webSocket.send);
            sinon.assert.calledWithExactly(webSocket.send, "foo");
        });
    });
    describe("onmessage", () => {
        it("passes on messages from underlying web socket", () => {
            var ws = new AutoReconnectingWebSocket(webSocketFactory, "url");
            ws.onmessage = sinon.stub();
            webSocket.onmessage("hi");
            sinon.assert.calledOnce(ws.onmessage);
            sinon.assert.calledWithExactly(ws.onmessage, "hi");
        });
    });
});
