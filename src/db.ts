/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { Connection, ConnectionOptions, createConnection, Logger, QueryRunner } from "typeorm";

import { config } from "./config";
import { sqlLogger } from "./logger";

class TypeOrmBridgeLogger implements Logger {

    public logQuery(query: string,
                    parameters?: any[] | undefined,
                    queryRunner?: QueryRunner | undefined) {
        if (config.env === "dev" && parameters != null) {
            sqlLogger.trace(`Running query: "${query}" (params: ${JSON.stringify(parameters)})`);
        } else {
            sqlLogger.trace(`Running query: "${query}"`);
        }
    }

    public logQueryError(error: string,
                         query: string,
                         parameters?: any[] | undefined,
                         queryRunner?: QueryRunner | undefined) {
        sqlLogger.error(`Failed to run query "${query}": ${error}`);
    }

    public logQuerySlow(time: number,
                        query: string,
                        parameters?: any[] | undefined,
                        queryRunner?: QueryRunner | undefined) {
        sqlLogger.warn(`Slow query "${query}" in ${time.toPrecision(3)}s`);
    }

    public logSchemaBuild(message: string,
                          queryRunner?: QueryRunner | undefined) {
        sqlLogger.info("Schema builder event:", message);
    }

    public logMigration(message: string,
                        queryRunner?: QueryRunner | undefined) {
        sqlLogger.info("Migration event:", message);
    }

    public log(level: "log" | "info" | "warn",
               message: any,
               queryRunner?: QueryRunner | undefined) {
        if (level === "log" || level === "info") {
            sqlLogger.info(message);
        } else if (level === "warn") {
            sqlLogger.warn(message);
        }
    }

}

let database: Connection | undefined;

export async function connectToDatabase(): Promise<Connection> {
    if (database !== undefined) {
        return database;
    }
    return database = await createConnection({
        ...config.db,
        logger: new TypeOrmBridgeLogger(),
        synchronize: (config.env === "dev" ? true : undefined),
    } as ConnectionOptions);
}
