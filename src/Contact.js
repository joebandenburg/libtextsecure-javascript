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

export default class Contact {
    constructor(otherContact) {
        Object.assign(this, {
            identityKey: null,
            devices: []
        }, otherContact);
        Object.seal(this);
    }

    removeDevices(deviceIds) {
        var devicesIdMap = {};
        deviceIds.forEach((id) => devicesIdMap[id] = 1);
        this.devices = this.devices.filter((device) => !devicesIdMap[device.id]);
    }

    getDevice(deviceId) {
        var devices = this.devices.filter((device) => device.id === deviceId);
        if (devices.length > 0) {
            return devices[0];
        }
        return null;
    }
}
