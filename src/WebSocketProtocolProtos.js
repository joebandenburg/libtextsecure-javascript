module.exports = require("protobufjs").newBuilder({})["import"]({
    "package": "textsecure",
    "messages": [
        {
            "name": "WebSocketRequestMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "string",
                    "name": "verb",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "string",
                    "name": "path",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "body",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint64",
                    "name": "id",
                    "id": 4
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "WebSocketResponseMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint64",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "status",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "string",
                    "name": "message",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "body",
                    "id": 4
                }
            ],
            "enums": [],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "WebSocketMessage",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "Type",
                    "name": "type",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "WebSocketRequestMessage",
                    "name": "request",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "WebSocketResponseMessage",
                    "name": "response",
                    "id": 3
                }
            ],
            "enums": [
                {
                    "name": "Type",
                    "values": [
                        {
                            "name": "UNKNOWN",
                            "id": 0
                        },
                        {
                            "name": "REQUEST",
                            "id": 1
                        },
                        {
                            "name": "RESPONSE",
                            "id": 2
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [],
            "options": {},
            "oneofs": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {},
    "services": []
}).build("textsecure");
