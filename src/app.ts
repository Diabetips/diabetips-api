/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Aug 27 2019
*/

import express = require("express");
import { NextFunction, Request, Response } from "express";

import { AuthController, FoodController, RecipeController, UserController } from "./controllers";
import { ApiError, HttpStatus } from "./lib";
import { httpLogger, log4js, logger } from "./logger";

export const app = express();

// Express settings
app.set("x-powered-by", false);

app.use(log4js.connectLogger(httpLogger, { level: "info" }));

// API routes
app.use("/v1/auth", new AuthController().router);
app.use("/v1/users", new UserController().router);
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
        logger.error(err.stack);
    }
});
