/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Aug 31 2019
*/

import { NextFunction, Request, Response } from "express";
import querystring = require("querystring");

import { config } from "../config";
import { AuthError } from "../errors";
import { HttpStatus } from "../lib";
import { logger } from "../logger";
import { AuthService, UserService } from "../services";
import { BaseController } from "./BaseController";
// tslint:disable-next-line: ordered-imports
import { SwaggerDefinitionConstant, ApiOperationPost, ApiPath } from "swagger-express-ts";

@ApiPath({
    path: "/auth",
    name: "Auth",
})
export class AuthController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/authorize",                        this.authorize,           this.errorHandler)
            .post("/authorize",      this.formParser, this.authorizeInternal)
            .post("/token",          this.formParser, this.token,               this.errorHandler)
            .post("/reset-password", this.jsonParser, this.resetPassword);
    }

    // TODO: Need documentation
    private authorize(req: Request, res: Response) {
        res.redirect(config.diabetips.accountUrl + "/oauth/authorize?" +
            querystring.stringify(req.query));
    }

    // TODO: Need documentation
    private async authorizeInternal(req: Request, res: Response) {
        res.send(await AuthService.authorize(req.context, req.body));
    }

    // TODO: Need documentation
    private async token(req: Request, res: Response) {
        res.send(await AuthService.getToken(req.context, req.body));
    }

    @ApiOperationPost({
        summary: "Register a new user",
        description: "Reset the password of the user with the specified email<br>"
        + "A new password is randomly generated and sent to the users email<br>"
        + "For privacy reasons, errors are **not** reported (e.g. email is not associated with any account)",
        responses: {
            202: {
                description: "Password reset request is being processed",
            },
        },
        parameters: {
            body: {
                description: "Body for a user registration",
                required: true,
                model: "ResetPasswordModel",
            },
        },
    })
    private async resetPassword(req: Request, res: Response) {
        await UserService.resetUserPassword(req.body);
        res
            .status(HttpStatus.ACCEPTED)
            .send({});
    }

    private errorHandler(err: Error | AuthError, req: Request, res: Response, next: NextFunction) {
        if (err instanceof AuthError) {
            res
                .status(400)
                .send({
                    error: err.error,
                    error_description: err.description,
                });
        } else {
            logger.error(err.stack || err);
            res
                .status(500)
                .send({
                    error: "server_error",
                    error_description: "Internal server error",
                });
        }
    }

}
