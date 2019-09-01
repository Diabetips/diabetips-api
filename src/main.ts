/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import http = require("http");
import net = require("net");
import "reflect-metadata";

import { app } from "./app";
import { config } from "./config";
import { getDatabase } from "./db";
import { log4js, logger } from "./logger";

async function main(args: string[]): Promise<void> {
    logger.info(`Starting ${config.pkg.name} version ${config.pkg.version}`);

    let once = false;
    process.on("SIGINT", (signal) => {
        if (once) { return; }
        once = true;

        logger.warn(`Received signal ${signal}: stopping server`);
        log4js.shutdown(() => {
            process.exit();
        });
    });

    await getDatabase();

    const server = http.createServer(app);
    server.listen(config.http, () => {
        const addr = server.address() as net.AddressInfo;
        const isIpV6 = addr.family === "IPv6";
        logger.info("Server listening on",
            isIpV6
            ? `[${addr.address}]:${addr.port}`
            : `${addr.address}:${addr.port}`);
    });
}

if (module.parent == null) {
    main(process.argv).then().catch((err: Error) => {
        logger.fatal(err.stack);
        process.exit(1);
    });
}
