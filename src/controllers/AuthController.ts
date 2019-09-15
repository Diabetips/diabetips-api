/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Aug 31 2019
*/

import { NextFunction, Request, Response } from "express";

import { AuthError } from "../errors";
import { HttpStatus } from "../lib";
import { logger } from "../logger";
import { AuthService, UserService } from "../services";
import { BaseController } from "./BaseController";

export class AuthController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/authorize", this.authorize, this.errorHandler)
            .post("/token", this.formParser, this.token, this.errorHandler)
            .post("/reset-password", this.jsonParser, this.resetPassword);
    }

    private authorize(req: Request, res: Response) {
        if (req.query.response_type === "code") {
            res.redirect("http://example.com/callback?code=abcdef&state=xyz");
        } else if (req.query.response_type === "token") {
            res.redirect("http://example.com/callback#access_token=abcdef&state=xyz&token_type=bearer&expires_in=3600");
        } else {
            res.redirect("http://example.com/callback?error=invalid_request");
        }
    }

    private async token(req: Request, res: Response) {
        res.send(await AuthService.getToken(req.body));
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
            logger.error(err.stack);
            res
                .status(500)
                .send({
                    error: "server_error",
                    error_description: "Internal server error",
                });
        }
    }

}
