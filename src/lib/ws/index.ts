/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import http = require("http");
import log4js = require("log4js");
import ws = require("ws");

import * as WebSocket from "ws";

import { WebSocketHandler } from "./WsHandler";

export * from "./WsHandler";
export * from "./WsApp";

export type Logger = (...args: any[]) => void;
export type Handler = (socket: WebSocket, req: http.IncomingMessage) => void;
export type ErrorHandler = (socket: WebSocket, req: http.IncomingMessage, err: Error) => void;

export type Application = Handler;

export interface WsAppOptions {
    handlers?: string[];
    logger?: Logger;
    defaultHandler?: Handler;
    errorHandler?: ErrorHandler;
}

export interface HandlerOptions {
    authenticate?: boolean;
};

export interface HandlerMetadata {
    target: (new() => WebSocketHandler);
    route: RegExp;
    keys: (string | number)[];
    options: HandlerOptions;
}

export interface HandlerMetadataArgs {
    target: (new() => WebSocketHandler);
    route: string | RegExp;
    options: HandlerOptions;
}

export class MetadataArgsStorage {
    public handlers: HandlerMetadataArgs[] = [];
}

export function bindLogger(logger: log4js.Logger, options: { level?: string }): Logger {
    const level = options.level || "info";
    return (...args: any[]) => {
        logger.log(level, ...args);
    };
}

export function useServer(app: Application, server: http.Server, options?: ws.ServerOptions) {
    const wsServer = new ws.Server({
        server,
        ...options,
    });

    wsServer.on("connection", app);
}
