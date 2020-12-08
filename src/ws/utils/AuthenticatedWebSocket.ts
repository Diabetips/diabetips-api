/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat May 02 2020
*/

import { ApiError } from "../../errors";
import { AuthInfo, AuthScope, HttpStatus } from "../../lib";
import { AuthService } from "../../services";

import { JsonWebSocket } from "./JsonWebSocket";

export class AuthenticatedWebSocket extends JsonWebSocket {

    protected auth?: AuthInfo;
    private _authTimeout?: NodeJS.Timeout;

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

            this.auth = await AuthService.authFromBearerToken(msg.token);

            clearTimeout(this._authTimeout!);
            delete this._authTimeout;
            this.onJsonMessage = onJsonMessage;

            return this.onAuthenticated();
        };
    }

    public async onAuthenticated() {
        //
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        if (this.auth == null) {
            clearTimeout(this._authTimeout!);
        }
    }

    protected async checkAuthorized(...scopes: AuthScope[]): Promise<void> {
        return AuthService.checkScopesAuthorized(this.auth, this.params, scopes);
    }

}
