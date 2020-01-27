/*!
** Copyright 2019-2020 Diabetips
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
import { AuthService, UserConfirmationService, UserService } from "../services";

import { BaseController } from "./BaseController";

export class AuthController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/authorize",                        this.authorize,           this.errorHandler)
            .post("/authorize",      this.formParser, this.authorizeInternal)
            .post("/token",          this.formParser, this.token,               this.errorHandler)
            .post("/confirm",        this.jsonParser, this.confirmAccount)
            .post("/reset-password", this.jsonParser, this.resetPassword);
    }

    private authorize(req: Request, res: Response) {
        res.redirect(config.diabetips.accountUrl + "/oauth/authorize?" + querystring.stringify(req.query));
    }

    private async authorizeInternal(req: Request, res: Response) {
        res.send(await AuthService.authorize(req.context, req.body));
    }

    private async token(req: Request, res: Response) {
        res.send(await AuthService.getToken(req.context, req.body));
    }

    private async confirmAccount(req: Request, res: Response) {
        await UserConfirmationService.confirmUserAccount(req.body);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

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
