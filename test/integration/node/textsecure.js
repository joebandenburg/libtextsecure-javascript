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

function Client(number) {
    var self = this;

    this.number = number;

    this.store = new InMemoryClientStore();
    this.ts = textsecure(this.store, "127.0.0.1:8080", webSocketFactory, {
        httpUseTls: false,
        webSocketUseTls: false,
        initialPreKeyGenerationCount: 2
    });
    this.ts.onmessage = function() {
        self.onmessage.apply(self, arguments);
    };
    this.ts.onreceipt = function() {
        self.onreceipt.apply(self, arguments);
    };
    sinon.spy(this.ts, "onmessage");
    sinon.spy(this.ts, "onreceipt");
}

var send = function(fromClient, toClient, message) {
    return function() {
        return fromClient.ts.sendMessage(toClient.number, message);
    };
};

var waitForMessage = function(client) {
    return function() {
        return new Promise(function(resolve) {
            client.onmessage = resolve;
        });
    };
};

var waitForReceipt = function(client) {
    return function() {
        return new Promise(function(resolve) {
            client.onreceipt = resolve;
        });
    };
};

var register = function(client) {
    return function() {
        return client.ts.requestVerificationCode(client.number).then(function() {
            return client.ts.registerFirstDevice(client.number, "123123");
        });
    };
};

var execute = function(commands) {
    return commands.reduce(function(previousValue, currentValue) {
        return previousValue.then(function() {
            return currentValue();
        });
    }, Promise.resolve());
};

describe("integration node", function() {
    this.timeout(10000);
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
    describe("private conversation", function() {
        var alice;
        var bob;

        beforeEach(function() {
            alice = new Client("+447100000001");
            bob = new Client("+447100000002");
        });
        it("can send a message between two clients", function() {
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob)
            ]).then(function() {
                sinon.assert.calledWithExactly(bob.ts.onmessage, alice.number, "Hello World!", 100100100);
            });
        });
        it("can send a reply", function() {
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob),
                send(bob, alice, "Right back at ya"),
                waitForMessage(alice)
            ]).then(function() {
                sinon.assert.calledWithExactly(alice.ts.onmessage, bob.number, "Right back at ya", 100100100);
            });
        });
        it("can receive a delivery receipt after sending a message", function() {
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForReceipt(alice)
            ]).then(function() {
                sinon.assert.calledWithExactly(alice.ts.onreceipt, bob.number, 100100100);
            });
        });
        it("tolerates initiating client re-registering and then sending a message", function() {
            var eve = new Client(alice.number);
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob),
                send(bob, alice, "Right back at ya"),
                waitForMessage(alice),
                register(eve),
                send(eve, bob, "I'm a whole new person"),
                waitForMessage(bob),
                send(bob, eve, "That's bad"),
                waitForMessage(eve)
            ]).then(function() {
                sinon.assert.calledWithExactly(eve.ts.onmessage, bob.number, "That's bad", 100100100);
            });
        });
        it("tolerates initiating client re-registering and receiving a message", function() {
            var eve = new Client(alice.number);
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob),
                send(bob, alice, "Right back at ya"),
                waitForMessage(alice),
                register(eve),
                send(bob, eve, "That's bad"),
                waitForMessage(eve)
            ]).then(function() {
                sinon.assert.calledWithExactly(eve.ts.onmessage, bob.number, "That's bad", 100100100);
            });
        });
        it("tolerates not-initiating client re-registering and sending a message", function() {
            var eve = new Client(bob.number);
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob),
                send(bob, alice, "Right back at ya"),
                waitForMessage(alice),
                register(eve),
                send(eve, alice, "I'm a whole new person"),
                waitForMessage(alice),
                send(alice, eve, "That's bad"),
                waitForMessage(eve)
            ]).then(function() {
                sinon.assert.calledWithExactly(eve.ts.onmessage, alice.number, "That's bad", 100100100);
            });
        });
        it("tolerates not-initiating client re-registering and receiving a message", function() {
            var eve = new Client(bob.number);
            return execute([
                register(alice),
                register(bob),
                send(alice, bob, "Hello World!"),
                waitForMessage(bob),
                send(bob, alice, "Right back at ya"),
                waitForMessage(alice),
                register(eve),
                send(alice, eve, "That's bad"),
                waitForMessage(eve)
            ]).then(function() {
                sinon.assert.calledWithExactly(eve.ts.onmessage, alice.number, "That's bad", 100100100);
            });
        });
    });
});
