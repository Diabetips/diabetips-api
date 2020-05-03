/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Apr 30 2020
*/

import * as WebSocket from "ws";

import { ApiError } from "../../errors";
import { HttpStatus, Utils } from "../../lib";

import { BaseWebSocket } from "./BaseWebSocket";

export abstract class JsonWebSocket extends BaseWebSocket {

    constructor() {
        super();
    }

    public sendJsonMessage(obj: any) {
        super.sendMessage(JSON.stringify(obj, Utils.jsonReplacer));
    }

    public async onMessage(data: WebSocket.Data) {
        if (data instanceof Buffer) {
            data = data.toString();
        }
        if (typeof(data) !== "string") {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_request", "Unrecognized data message format");
        }

        let msg;
        try {
            msg = JSON.parse(data);
        } catch (err) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_request", err.message);
        }

        return this.onJsonMessage(msg);
    }

    public async onJsonMessage(msg: any) {
        //
    }

}
