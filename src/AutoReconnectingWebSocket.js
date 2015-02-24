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

var autoReconnectThrottleMilliseconds = 5000;

function AutoReconnectingWebSocket(webSocketFactory, url) {
    this.send = function(data) {
        webSocket.send(data);
    };

    var webSocket;
    var self = this;

    var createWebSocket = throttle(() => {
        webSocket = webSocketFactory.connect(url);
        webSocket.onclose = createWebSocket;
        webSocket.onmessage = function() {
            self.onmessage.apply(self, arguments);
        };
    }, autoReconnectThrottleMilliseconds);

    createWebSocket();
}

function throttle(func, waitMilliseconds) {
    var previous = 0;
    return function() {
        var timeout = null;
        var now = Date.now();
        var remaining = waitMilliseconds - (now - previous);
        if (remaining <= 0 || remaining > waitMilliseconds) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, arguments);
        } else {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, arguments);
            }, remaining);
        }
    };
}

export default AutoReconnectingWebSocket;
