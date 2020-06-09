/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat May 02 2020
*/

import { ApiError } from "../../errors";
import { AuthInfo, HttpStatus } from "../../lib";
import { AuthService } from "../../services";

import { JsonWebSocket } from "./JsonWebSocket";

export class AuthenticatedWebSocket extends JsonWebSocket {

    private _authenticated = false;
    private _authTimeout: NodeJS.Timeout;

    constructor() {
        super();

        this._authTimeout = setTimeout(() => {
            this.throw(new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token"));
        }, 60000);

        const onJsonMessage = this.onJsonMessage;
        this.onJsonMessage = async (msg) => {
            if (typeof(msg) !== "object" || typeof(msg.token) !== "string") {
                throw new ApiError(HttpStatus.BAD_REQUEST, "bad_request", "Invalid authentication message");
            }

            const auth = await AuthService.decodeToken(msg.token);

            this._authenticated = true;
            clearTimeout(this._authTimeout);
            delete this._authTimeout;
            this.onJsonMessage = onJsonMessage;

            return this.onAuthenticated(auth);
        };
    }

    public async onAuthenticated(auth: AuthInfo) {
        //
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        if (!this._authenticated) {
            clearTimeout(this._authTimeout);
        }
    }

}
