/**
 * Copyright (C) 2015 Joe Bandenburg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import WebSocketProtocolProtos from "./WebSocketProtocolProtos";

var WebSocketMessage = WebSocketProtocolProtos.WebSocketMessage;

var keepAliveIntervalMilliseconds = 15000;

/**
 *
 * @param {WebSocket} webSocket - an object compatible with the W3C WebSocket API.
 * @constructor
 */
function WebSocketPushTransport(webSocket) {
    var self = this;

    this.onmessage = () => {};

    webSocket.onmessage = (webSocketMessageBytes) => {
        var webSocketMessage = WebSocketMessage.decode(webSocketMessageBytes);
        if (webSocketMessage.type === WebSocketMessage.Type.RESPONSE) {
            // TODO: Handle
            return Promise.resolve();
        } else {
            var request = webSocketMessage.request;
            request.body = request.body.toArrayBuffer();
            return handleRequest(request).then(() => {
                sendResponse(request.id, 200, "OK");
            }, () => {
                // TODO: Log error
                sendResponse(request.id, 500, "");
            });
        }
    };

    var handleRequest = (request) => {
        var requestHandler = requestHandlers[request.verb + ":" + request.path];
        if (!requestHandler) {
            return Promise.reject(new Error("Unhandled request", request));
        }
        return Promise.resolve(requestHandler(request.id, request.body));
    };

    var sendResponse = (id, status, message) => {
        var data = new WebSocketMessage({
            type: WebSocketMessage.Type.RESPONSE,
            response: {
                id: id,
                status: status,
                message: message
            }
        }).encode().toArrayBuffer();
        webSocket.send(data);
    };

    var requestHandlers = {
        "PUT:/api/v1/message": (id, body) => {
            return self.onmessage(body);
        }
    };

    setInterval(() => {
        var message = new WebSocketMessage({
            type: WebSocketMessage.Type.REQUEST,
            request: {
                verb: "GET",
                path: "/v1/keepalive"
            }
        }).encode().toArrayBuffer();
        webSocket.send(message);
    }, keepAliveIntervalMilliseconds);
}

export default WebSocketPushTransport;
