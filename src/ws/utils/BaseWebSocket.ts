/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun May 03 2020
*/

import { ApiError } from "../../errors";
import { HttpStatus } from "../../lib";
import { WebSocketHandler } from "../../lib/ws";

export abstract class BaseWebSocket extends WebSocketHandler {

    private _pingTimeout: NodeJS.Timeout;

    constructor() {
        super()
        this._pingTimeout = setTimeout(() => {
            this.throw(new ApiError(HttpStatus.BAD_REQUEST,
                "timeout", "WebSocket connection timed out due to ping inactivity"));
        }, 300000);
    }

    public async onPing() {
        this._pingTimeout.refresh();
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        clearTimeout(this._pingTimeout);
    }

}
