/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // Express patch to handle errors correctly while using async handlers
import { NextFunction, Request, Response } from "express";
import { Action, BadRequestError, useExpressServer } from "routing-controllers";

import { config } from "./config";
import { getDocsSpec } from "./docs";
import { ApiError, ValidationError } from "./errors";
import { Context, HttpStatus, Utils } from "./lib";
import { httpLogger, log4js, logger } from "./logger";
import { AuthService } from "./services";

const preapp = express();

// Express settings
preapp.set("trust proxy", config.http.proxy ? 1 : false);
preapp.set("json replacer", Utils.jsonReplacer);
preapp.set("x-powered-by", false);

// Middlewares
preapp.use(log4js.connectLogger(httpLogger, {
    level: "info",
    format: ":remote-addr > \":method :url\" > :status :content-lengthB :response-timems",
}));

// Setup routing-controllers
export const app = useExpressServer(preapp, {
    ctxBuilder: (async (action: Action): Promise<Context> => {
        // both set context in req and return to rounting-controllers
        return {
            auth: await AuthService.decodeAuthorization(action.request.header("Authorization")),
        };
    }),
    controllers: [ `${__dirname}/controllers/**/*.{js,ts}` ],
    cors: {
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["X-Pages"],
    },
    validation: {
        validationError: {
            target: false,
            value: false,
        },
    },
    classTransformer: true,
    defaultErrorHandler: false,
    defaults: {
        undefinedResultCode: 204,
    },
});

// Static routes
app.get("/", (req: Request, res: Response) => {
    res.send({
        documentation_url: "https://docs.diabetips.fr/",
    });
});
app.get("/openapi.yml", getDocsSpec);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    throw new ApiError(HttpStatus.NOT_FOUND,
        "invalid_route",
        `${req.method} ${req.originalUrl.split("?", 1)[0]} is not a valid route on this server`);
});

// Error handler
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof BadRequestError) {
        err = new ValidationError(err);
    }
    if (err instanceof ApiError) {
        if (err.error !== "invalid_route") {
            logger.warn(err);
        }
        res
            .status(err.status)
            .type("json")
            .send({
                ...err,
                message: err.message,
            });
    } else if (err && typeof((err as any).status) === "number") {
        const httpError = err as any;
        res
            .status(httpError.status)
            .type("json")
            .send({
                status: httpError.status,
                error: "http",
                message: httpError.message,
            });
    } else {
        logger.error(err.stack || err);
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .type("json")
            .send({
                error: "server_error",
                message: "Internal server error",
            });
    }
});
