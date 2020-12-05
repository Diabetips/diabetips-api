/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import "reflect-metadata";

import admin = require("firebase-admin");
import http = require("http");
import net = require("net");

import { app, wsApp } from "./app";
import { config } from "./config";
import { connectToDatabase } from "./db";
import { log4js, logger } from "./logger";
import { useServer as wsUseServer } from "./lib/ws";
import { metricsApp } from "./metrics";

async function main(args: string[]): Promise<void> {
    logger.info(`Starting ${config.pkg.name} ${config.pkg.version} ${config.env}`);

    let once = false;
    process.on("SIGINT", (signal) => {
        if (once) { return; }
        once = true;

        logger.warn(`Received signal ${signal}: stopping server`);
        log4js.shutdown(() => {
            process.exit();
        });
    });

    await connectToDatabase();

    admin.initializeApp({
        credential: admin.credential.cert(config.firebase),
    });

    const listen = (server: http.Server, options: net.ListenOptions, name: string) => {
        server.listen(options, () => {
            const addr = server.address() as net.AddressInfo;
            const isIpV6 = addr.family === "IPv6";
            logger.info(`${name} server listening on`,
                isIpV6
                ? `[${addr.address}]:${addr.port}`
                : `${addr.address}:${addr.port}`);
        });
    };

    const server = http.createServer(app);
    wsUseServer(wsApp, server, config.ws);
    listen(server, config.http, "API");

    const metricsServer = http.createServer(metricsApp);
    listen(metricsServer, config.metrics.http, "Metrics");
}

if (module.parent == null) {
    main(process.argv)
        .catch((err: Error) => {
            logger.fatal(err.stack || err);
            process.exit(1);
        });
}
