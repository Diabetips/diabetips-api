/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import http = require("http");

import * as WebSocket from "ws";

import { HandlerOptions } from ".";
import { getMetadataArgsStorage } from "./MetadataArgsStorage";

export abstract class WebSocketHandler {

    public throw: (err: Error) => void;

    public req: http.IncomingMessage;
    public ws: WebSocket;

    public params: { [key: string]: string };

    public async onConnect(): Promise<void> {
        //
    }

    public async onDisconnect(code: number, reason: string): Promise<void> {
        //
    }

    public async onMessage(data: WebSocket.Data): Promise<void> {
        //
    }

    public async onPing(data: Buffer): Promise<void> {
        //
    }

    public sendMessage(data: WebSocket.Data) {
        this.ws.send(data);
    }

}

/**
 * Defines a class as a Web Socket handler.
 */
export function WSHandler(route: string | RegExp = "*", options: HandlerOptions = {}): (object: (new() => WebSocketHandler)) => void {
    return (object: (new() => WebSocketHandler)) => {
        getMetadataArgsStorage().handlers.push({
            target: object,
            route,
            options,
        });
    };
}
