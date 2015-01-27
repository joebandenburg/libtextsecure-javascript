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

export class NoSuchContactException extends Error {}
export class InvalidCredentialsException extends Error {}
export class MismatchedDevicesException extends Error {
    constructor(missingDevices, extraDevices) {
        super();
        this.missingDevices = missingDevices;
        this.extraDevices = extraDevices;
    }
}
export class StaleDevicesException extends Error {
    constructor(staleDevices) {
        super();
        this.staleDevices = staleDevices;
    }
}
export class BadlyFormattedMessageBodyException extends Error {}
export class IncorrectVerificationCodeException extends Error {}
export class NumberAlreadyRegisteredException extends Error {}
