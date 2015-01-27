module.exports = require("protobufjs").newBuilder({})["import"]({
    "package": "textsecure",
    "messages": [
        {
            "name": "IncomingPushMessageSignal",
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
                    "type": "string",
                    "name": "source",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "sourceDevice",
                    "id": 7
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "string",
                    "name": "relay",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint64",
                    "name": "timestamp",
                    "id": 5
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "bytes",
                    "name": "message",
                    "id": 6
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
                            "name": "CIPHERTEXT",
                            "id": 1
                        },
                        {
                            "name": "KEY_EXCHANGE",
                            "id": 2
                        },
                        {
                            "name": "PREKEY_BUNDLE",
                            "id": 3
                        },
                        {
                            "name": "PLAINTEXT",
                            "id": 4
                        },
                        {
                            "name": "RECEIPT",
                            "id": 5
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [],
            "options": {},
            "oneofs": {}
        },
        {
            "name": "PushMessageContent",
            "fields": [
                {
                    "rule": "optional",
                    "options": {},
                    "type": "string",
                    "name": "body",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "options": {},
                    "type": "AttachmentPointer",
                    "name": "attachments",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "GroupContext",
                    "name": "group",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "options": {},
                    "type": "uint32",
                    "name": "flags",
                    "id": 4
                }
            ],
            "enums": [
                {
                    "name": "Flags",
                    "values": [
                        {
                            "name": "END_SESSION",
                            "id": 1
                        }
                    ],
                    "options": {}
                }
            ],
            "messages": [
                {
                    "name": "AttachmentPointer",
                    "fields": [
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "fixed64",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "string",
                            "name": "contentType",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "bytes",
                            "name": "key",
                            "id": 3
                        }
                    ],
                    "enums": [],
                    "messages": [],
                    "options": {},
                    "oneofs": {}
                },
                {
                    "name": "GroupContext",
                    "fields": [
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "bytes",
                            "name": "id",
                            "id": 1
                        },
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "Type",
                            "name": "type",
                            "id": 2
                        },
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "string",
                            "name": "name",
                            "id": 3
                        },
                        {
                            "rule": "repeated",
                            "options": {},
                            "type": "string",
                            "name": "members",
                            "id": 4
                        },
                        {
                            "rule": "optional",
                            "options": {},
                            "type": "AttachmentPointer",
                            "name": "avatar",
                            "id": 5
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
                                    "name": "UPDATE",
                                    "id": 1
                                },
                                {
                                    "name": "DELIVER",
                                    "id": 2
                                },
                                {
                                    "name": "QUIT",
                                    "id": 3
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
            "options": {},
            "oneofs": {}
        }
    ],
    "enums": [],
    "imports": [],
    "options": {},
    "services": []
}).build("textsecure");
