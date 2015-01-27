var http = require("http");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var assert = chai.assert;

var textsecure = require("../../../dist/textsecure");

describe("integration node", function() {
    it("works", function() {
        var stub = function() { return 1; };
        var store = {
            getLocalIdentityKeyPair: stub,
            getLocalRegistrationId: stub,
            getLocalSignedPreKeyPair: stub,
            getLocalPreKeyPair: stub,
            contacts: {},
            hasContact: function(number) { return Promise.resolve(!!store.contacts[number]); },
            putContact: function(number, contact) { return Promise.resolve(store.contacts[number] = contact); },
            getContact: function(number) { return Promise.resolve(store.contacts[number]); }
        };
        var ts = textsecure(store, "http://127.0.0.1:8080");
        // TODO: Replace with a real server (textsecure-server-node)
        http.createServer(function(req, res) {
            res.writeHead(404);
            res.end("");
        }).listen(8080, "127.0.0.1");
        return assert.isRejected(ts.sendMessage("+447000000001", "Hello World!"));
    });
});
