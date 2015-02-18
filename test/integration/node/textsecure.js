var Server = require("textsecure-server/lib/Server");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var WebSocket = require("ws");
var sinon = require("sinon");

chai.use(chaiAsPromised);
var assert = chai.assert;

var textsecure = require("../../../dist/textsecure");

function InMemoryClientStore() {
    this.localState = null;
    this.contacts = {};
    this.preKeys = {};
    this.signedPreKeys = {};
}

InMemoryClientStore.prototype.getLocalState = function() {
    return Promise.resolve(this.localState);
};

InMemoryClientStore.prototype.putLocalState = function(localState) {
    return Promise.resolve(this.localState = localState);
};

InMemoryClientStore.prototype.getLocalPreKeyPair = function(id) {
    return Promise.resolve(this.preKeys[id]);
};

InMemoryClientStore.prototype.putLocalPreKeyPair = function(id, preKey) {
    return Promise.resolve(this.preKeys[id] = preKey);
};

InMemoryClientStore.prototype.getLocalSignedPreKeyPair = function(id) {
    return Promise.resolve(this.signedPreKeys[id]);
};

InMemoryClientStore.prototype.putLocalSignedPreKeyPair = function(id, preKey) {
    return Promise.resolve(this.signedPreKeys[id] = preKey);
};

InMemoryClientStore.prototype.hasContact = function(number) {
    return Promise.resolve(!!this.contacts[number]);
};

InMemoryClientStore.prototype.getContact = function(number) {
    return Promise.resolve(this.contacts[number]);
};

InMemoryClientStore.prototype.putContact = function(number, contact) {
    return Promise.resolve(this.contacts[number] = contact);
};

function InMemoryServerStore() {
    this.contacts = {};
}

InMemoryServerStore.prototype.getContact = function(number) {
    return Promise.resolve(this.contacts[number]);
};

InMemoryServerStore.prototype.putContact = function(number, contact) {
    return Promise.resolve(this.contacts[number] = contact);
};

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

var webSocketFactory = {
    connect: function(url) {
        var webSocket = new WebSocket(url);
        var webSocketWrapper = {
            send: function(data) {
                webSocket.send(toBuffer(data));
            }
        };
        webSocket.onmessage = function(event) {
            webSocketWrapper.onmessage(toArrayBuffer(event.data));
        };
        return webSocketWrapper;
    }
};

var textSecureOptions = {
    httpUseTls: false,
    webSocketUseTls: false,
    initialPreKeyGenerationCount: 1
};

describe("integration node", function() {
    var server;
    var serverStore;
    var clock;
    beforeEach(function() {
        clock = sinon.useFakeTimers(100100100);
        serverStore = new InMemoryServerStore();
        server = new Server(serverStore, 8080);
    });
    afterEach(function() {
        clock.restore();
        server.close();
    });
    it("can send a message between two clients", function() {
        var aliceNumber = "+447100000001";
        var aliceStore = new InMemoryClientStore();
        var alice = textsecure(aliceStore, "127.0.0.1:8080", webSocketFactory, textSecureOptions);
        var bobNumber = "+447100000002";
        var bobStore = new InMemoryClientStore();
        var bob = textsecure(bobStore, "127.0.0.1:8080", webSocketFactory, textSecureOptions);
        var receivedMessagePromise = new Promise(function(resolve) {
            bob.onmessage = resolve;
            sinon.spy(bob, "onmessage");
        });
        alice.requestVerificationCode(aliceNumber).then(function() {
            return alice.registerFirstDevice(aliceNumber, "123123");
        }).then(function() {
            return bob.requestVerificationCode(bobNumber);
        }).then(function() {
            return bob.registerFirstDevice(bobNumber, "123123");
        }).then(function() {
            return alice.sendMessage(bobNumber, "Hello World!");
        });
        return receivedMessagePromise.then(function() {
            sinon.assert.calledWithExactly(bob.onmessage, "+447100000001", "Hello World!", 100100100);
        });
    });
});
