/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

// tslint:disable-next-line:no-var-requires
const pkg = require("../package.json");

const profiles = {
    dev: {
        db: {
            type: "sqlite",
            database: `${pkg.name}_dev.sqlite`,
            synchronize: true,
        },
    },
    test: {
    },
    preprod: {
    },
    prod: {
    },
};

const profile = profiles.dev; // TODO: autoselect profile from env variable or w/e

export const config = {
    db: {
        ...profile.db,
        entities: [
            __dirname + "/entities/**/*.{js,ts}",
        ],
    },
    http: {
        host: "::",
        port: "8080",
    },
    logger: {
        appenders: {
            console: {
                type: "console",
            },
            file: {
                type: "file",
                filename: `logs/${pkg.name}.log`,
                maxLogSize: 10 * 1024 * 1024,
                backups: 10,
                compress: true,
                keepFileExt: true,
            },
        },
        categories: {
            default: {
                appenders: ["console", "file"],
                level: "all",
            },
            http: {
                appenders: ["console", "file"],
                level: "all",
            },
            sql: {
                appenders: ["console", "file"],
                level: "all",
            },
        },
    },
    pkg,
};
