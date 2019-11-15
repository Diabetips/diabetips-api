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
import { AuthController, FoodController, RecipeController,
    UserConnectionController, UserController, UserMealController } from "./controllers";
import { ApiError } from "./errors";
import { HttpStatus, Utils } from "./lib";
import { httpLogger, log4js, logger } from "./logger";
import { AuthService } from "./services";
import { UserGlucoseController } from "./controllers/UserGlucoseController";

export const app = express();

// Swagger doc generator
app.use(swagger.express(
    {
        definition: {
            info: {
                title: "My api",
                version: "1.0",
            },
        },
    },
));

app.use("/v1/api-docs/swagger", express.static("swagger"));
app.use("/api-docs/swagger/assets", express.static("node_modules/swagger-ui-dist"));

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
    res.send({});
});
const apiVersion = "v1";
app.use("/" + apiVersion + "/auth", new AuthController().router);
app.use("/" + apiVersion + "/users", new UserController().router);
app.use("/" + apiVersion + "/users", new UserConnectionController().router);
app.use("/" + apiVersion + "/users", new UserMealController().router);
app.use("/" + apiVersion + "/users", new UserGlucoseController().router);
app.use("/" + apiVersion + "/food", new FoodController().router);
app.use("/" + apiVersion + "/recipes", new RecipeController().router);

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
