/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import cors = require("cors");
import express = require("express");
// tslint:disable-next-line:no-var-requires
require("express-async-errors"); // Express patch to handle errors correctly while using async handlers
import { NextFunction, Request, Response } from "express";

import {
    AuthAppController,
    AuthAppLogoController,
    AuthController,
    FoodController,
    FoodPictureController,
    RecipeController,
    UserAppController,
    UserConnectionController,
    UserController,
    UserGlucoseController,
    UserHba1cController,
    UserInsulinController,
    UserMealController,
    UserPictureController,
} from "./controllers";
import { UserEventController } from "./controllers/UserEventController";
import { UserNoteController } from "./controllers/UserNoteController";
import { getDocsSpec } from "./docs";
import { ApiError } from "./errors";
import { HttpStatus, Utils } from "./lib";
import { httpLogger, log4js, logger } from "./logger";
import { AuthService } from "./services";
import { UserHeightController } from "./controllers/UserHeightController";
import { UserMassController } from "./controllers/UserMassController";

export const app = express();

// Express settings
app.set("json replacer", Utils.jsonReplacer);
app.set("x-powered-by", false);

// Middlewares
app.use(cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Pages"],
}));
app.use(log4js.connectLogger(httpLogger, { level: "info" }));
app.use(async (req: Request, res: Response, next: NextFunction) => {
    req.context = {
        auth: await AuthService.decodeAuthorization(req.header("Authorization")),
    };
    next();
});

app.get("/", (req: Request, res: Response) => {
    res.send({
        documentation_url: "https://docs.diabetips.fr/",
    });
});
app.get("/openapi.yml", getDocsSpec);

// API routes
app.use("/v1/auth", new AuthController().router);
app.use("/v1/auth/apps", new AuthAppController().router);
app.use("/v1/auth/apps", new AuthAppLogoController().router);
app.use("/v1/food", new FoodController().router);
app.use("/v1/food", new FoodPictureController().router);
app.use("/v1/recipes", new RecipeController().router);
app.use("/v1/users", new UserController().router);
app.use("/v1/users", new UserAppController().router);
app.use("/v1/users", new UserConnectionController().router);
app.use("/v1/users", new UserGlucoseController().router);
app.use("/v1/users", new UserHba1cController().router);
app.use("/v1/users", new UserMealController().router);
app.use("/v1/users", new UserInsulinController().router);
app.use("/v1/users", new UserNoteController().router);
app.use("/v1/users", new UserHeightController().router);
app.use("/v1/users", new UserMassController().router);
app.use("/v1/users", new UserEventController().router);
app.use("/v1/users", new UserPictureController().router);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
    throw new ApiError(HttpStatus.NOT_FOUND,
        "invalid_route",
        `${req.method} ${req.originalUrl.split("?", 1)[0]} is not a valid route on this server`);
});

// Error handler
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        res
            .status(err.status)
            .type("json")
            .send({
                status: err.status,
                error: err.error,
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
                error: "Internal server error",
            });
    }
});
