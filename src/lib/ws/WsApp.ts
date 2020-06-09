/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Apr 30 2020
*/

import glob = require("glob");
import http = require("http");

import { Key, pathToRegexp } from "path-to-regexp";
import * as WebSocket from "ws";

import { Application, HandlerMetadata, WebSocketHandler, WsAppOptions } from ".";
import { getMetadataArgsStorage } from "./MetadataArgsStorage";

export function WsApp(options: WsAppOptions = {}): Application {
    const handlerClasses = loadClassesFromDirectories(options.handlers || []);
    const handlers = getMetadataArgsStorage().handlers
        .filter((hdlr) => {
            return handlerClasses.filter(cls => hdlr.target === cls).length > 0;
        })
        .map((handlerArgs): HandlerMetadata => {
            const keys: Key[] = [];
            return {
                target: handlerArgs.target,
                route: pathToRegexp(handlerArgs.route || "*", keys, {
                    sensitive: false,
                    strict: false
                }),
                keys: keys.map((key) => key.name),
                options: handlerArgs.options
            };
        });

    const logger = options.logger || (() => undefined);
    const defaultHandler = options.defaultHandler || ((socket) => { socket.close(1002); });
    const errorHandler = options.errorHandler || ((socket) => { socket.close(1011); });

    return (socket: WebSocket, req: http.IncomingMessage) => {
        if (req.url == null) {
            throw new Error("req.url undefined");
        }

        const url = req.url;
        const remote = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        const log = `${remote} > ${url} >`;
        logger(log, "connected");
        socket.on("close", (code) => { logger(log, `disconnected (${code})`); });

        const handler = handlers.find((hdlr) => url.match(hdlr.route));
        if (handler == null) {
            defaultHandler(socket, req);
            return;
        }

        const m = url.match(handler.route) as RegExpMatchArray;
        const params: { [key: string]: string } = {};
        for (let i = 1; i < m?.length; ++i) {
            const key = handler.keys[i - 1];
            if (!params.hasOwnProperty(key)) {
                params[key] = decodeURIComponent(m[i]);
            }
        }

        try {
            const instance = new (handler.target as (new() => WebSocketHandler))();
            instance.throw = (err) => { errorHandler(socket, req, err); };
            instance.req = req;
            instance.ws = socket;
            instance.params = params;

            const _ = (f: (...args: any[]) => Promise<void>) => {
                return (...args: any[]) => {
                    f.call(instance, ...args).catch((err) => { errorHandler(socket, req, err); });
                };
            };

            socket.on("message", _(instance.onMessage));
            socket.on("ping", _(instance.onPing));
            socket.on("close", _(instance.onDisconnect));

            _(instance.onConnect)();
        } catch (err) {
            errorHandler(socket, req, err);
        }
    };
}

function loadClassesFromDirectories(directories: string[]) {
    const files = directories.reduce((allDirs, dir) => {
        return allDirs.concat(glob.sync(dir));
    }, [] as string[]);

    const modules = files
        .filter((file) => !file.endsWith(".d.ts"))
        .map(require);

    const getFileClasses = (exported: any, allLoaded: object[]) => {
        if (exported instanceof Function) {
            allLoaded.push(exported);
        } else if (exported instanceof Array) {
            exported.forEach((i: any) => getFileClasses(i, allLoaded));
        } else if (exported instanceof Object || typeof exported === "object") {
            Object.keys(exported).forEach(key => getFileClasses(exported[key], allLoaded));
        }
        return allLoaded;
    };

    return getFileClasses(modules, []);
}
