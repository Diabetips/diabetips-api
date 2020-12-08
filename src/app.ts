/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // Patch Express to handle errors in async handlers correctly
import { NextFunction, Request, Response } from "express";
import { Action, BadRequestError, useExpressServer } from "routing-controllers";
import { QueryFailedError } from "typeorm";

import { config } from "./config";
import { getDocsSpec } from "./docs";
import { ApiError, AuthError, ValidationError } from "./errors";
import { AuthScope, Context, HttpStatus, Utils } from "./lib";
import { WsApp, bindLogger as wsBindLogger } from "./lib/ws";
import { httpLogger, log4js, logger, wsLogger } from "./logger";
import { requestResponseSize, requestResponseTime, requestTotals } from "./metrics";
import { AuthService } from "./services";

const preapp = express();

// Express settings
preapp.set("trust proxy", config.http.proxy ? 1 : false);
preapp.set("json replacer", Utils.jsonReplacer);
preapp.set("x-powered-by", false);

// Middlewares
preapp.use((req, res, next) => {
    if (req.method === "OPTIONS") return next();

    const start = process.hrtime()
    res.on("finish", () => {
        const delta = process.hrtime(start);
        const responseTime = delta[0] * 1000 + delta[1] / 1000000;

        let route = req.route?.path ?? req.url;
        if (route instanceof RegExp) {
            route = (route as any)._str;
        }
        const labels = {
            method: req.method,
            route,
            response_code: res.statusCode,
        };

        requestResponseTime.observe(labels, responseTime);
        requestResponseSize.observe(labels, Number.parseInt(res.get("content-length") ?? 0, 10));
        requestTotals.inc(labels);
    });
    next();
});

preapp.use(log4js.connectLogger(httpLogger, {
    level: "info",
    format: ":remote-addr > \":method :url\" > :status :content-lengthB :response-timems",
}));

async function buildContext(action: Action): Promise<Context> {
    return {
        auth: await AuthService.authFromRequest(action.request),
    };
}

// Setup routing-controllers
export const app = useExpressServer(preapp, {
    authorizationChecker: (async (action, scopes: AuthScope[]): Promise<boolean> => {
        const ctx = await buildContext(action);
        action.context = ctx; // cache our context for ctxBuilder
        await AuthService.checkScopesAuthorized(ctx.auth, action.request.params || {}, scopes);
        return true;
    }),
    ctxBuilder: (async (action: Action): Promise<Context> => {
        if (action.context !== undefined) {
            return action.context;
        }
        return buildContext(action);
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
app.get("/", (req, res) => {
    res.send({
        documentation_url: `https://docs.${config.env === "dev" ? "dev." : ""}diabetips.fr/`,
    });
});
app.get("/openapi.yml", getDocsSpec);

app.use((req, res, next) => {
    if (!res.headersSent) {
        return next()
    }
});

// 404 handler
app.use((req, res, next) => {
    throw new ApiError(HttpStatus.NOT_FOUND,
        "invalid_route",
        `${req.method} ${req.originalUrl.split("?", 1)[0]} is not a valid route on this server`);
});

// Unidentified error to ApiError converter
function convertError(err: Error): ApiError {
    if (err instanceof ApiError) {
        return err;
    }

    // Convert common errors
    if (err instanceof AuthError) {
        return new ApiError(HttpStatus.BAD_REQUEST, "invalid_auth", err.message);
    }
    if (err instanceof BadRequestError) {
        return new ValidationError(err);
    }
    if (err instanceof QueryFailedError && (err as any).routine === "string_to_uuid") {
        return new ApiError(HttpStatus.BAD_REQUEST, "malformed_uuid", "Malformed UUID")
    }
    if (err && typeof((err as any).status) === "number") {
        const httpError = err as any;
        return new ApiError(httpError.status, httpError.status === 400 ? "bad_request" : "http", httpError.message);
    }

    logger.error(err.stack || err);
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "server_error", "Internal server error");
}

// Error handler
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    const apiErr = convertError(err);

    if (apiErr.error !== "invalid_route" &&
        apiErr.error !== "server_error" &&
        apiErr.error !== "http") {
        logger.warn(apiErr.name + ":", apiErr.message);
    }

    res
        .status(apiErr.status)
        .type("json")
        .send({
            ...apiErr,
            message: apiErr.message,
        });
});


// Setup WebSocket app
export const wsApp = WsApp({
    handlers: [ `${__dirname}/ws/**/*.{js,ts}` ],
    logger: wsBindLogger(wsLogger, {
        level: "info",
    }),
    defaultHandler: ((socket, req) => {
        throw new ApiError(HttpStatus.NOT_FOUND,
            "invalid_route",
            `${req.url?.split("?", 1)[0]} is not a valid route on this server`);
    }),
    errorHandler: ((socket, req, err) => {
        const apiErr = convertError(err);

        if (apiErr.error !== "invalid_route" &&
            apiErr.error !== "server_error") {
            logger.warn(apiErr.name + ":", apiErr.message);
        }

        socket.send(JSON.stringify({
            ...apiErr,
            message: apiErr.message,
        }));
        socket.close(apiErr.error !== "server_error" ? 1002 : 1011, apiErr.message);
    }),
});
