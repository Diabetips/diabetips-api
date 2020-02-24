/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Feb 23 2020
*/

import http = require("http");
import ws = require("ws");

import { config } from "../config";

export function useServer(server: http.Server) {
    const wsServer = new ws.Server({
        server,
        ...config.ws,
    });

    wsServer.on("connection", (socket, req) => {
        const url = req.url;
        const remote = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        socket.close();
    });
}
