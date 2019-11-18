/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import cors = require("cors");
import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // patch express to forward errors in async handlers
import { NextFunction, Request, Response } from "express";
import * as swagger from "swagger-express-ts";

import { config } from "./config";
import { AuthAppController, AuthController, FoodController, RecipeController,
    UserAppController, UserConnectionController, UserController, UserGlucoseController,
    UserHbA1CController, UserInsulinController, UserMealController } from "./controllers";
import { ApiError } from "./errors";
import { HttpStatus, Utils } from "./lib";
import { httpLogger, log4js, logger } from "./logger";
import { AuthService } from "./services";

export const app = express();

// Swagger doc generator
app.use(swagger.express(
    {
        path: "/docs/swagger.json",
        definition: {
            info: {
                title: "Diabetips API",
                description: "This is the documentation for the Diabetips API.",
                version: config.pkg.version,
                contact: {
                    email: "contact@diabetips.fr",
                },
            },
        },
    },
));

app.use("/docs", express.static("swagger"));
app.use("/docs/assets", express.static("node_modules/swagger-ui-dist"));

// Express settings
app.set("json replacer", Utils.jsonReplacer);
app.set("x-powered-by", false);

// Middlewares
app.use(cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(log4js.connectLogger(httpLogger, { level: "info" }));
app.use(async (req: Request, res: Response, next: NextFunction) => {
    req.context = {
        auth: await AuthService.decodeAuthorization(req.header("Authorization")),
    };
    next();
});

// API routes
app.get("/", (req: Request, res: Response) => {
    res.send({
        documentation_url: "/docs",
    });
});

app.use("/v1/auth", new AuthController().router);
app.use("/v1/auth", new AuthAppController().router);
app.use("/v1/users", new UserController().router);
app.use("/v1/users", new UserAppController().router);
app.use("/v1/users", new UserConnectionController().router);
app.use("/v1/users", new UserMealController().router);
app.use("/v1/users", new UserGlucoseController().router);
app.use("/v1/users", new UserInsulinController().router);
app.use("/v1/users", new UserHbA1CController().router);
app.use("/v1/food", new FoodController().router);
app.use("/v1/recipes", new RecipeController().router);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    throw new ApiError(HttpStatus.NOT_FOUND,
        "invalid_route",
        `"${req.method} ${req.originalUrl.split("?", 1)[0]}" is not a valid route on this server`);
});

// Error handler
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        res
            .status(err.status)
            .send({
                status: err.status,
                error: err.error,
                message: err.message,
            });
    } else {
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send({
                error: "Internal server error",
            });
        logger.error(err.stack || err);
    }
});
