/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Aug 31 2019
*/

import { Request, Response } from "express";

import { UserService } from "../services";
import { ApiError, BaseController, HttpStatus } from "./BaseController";

export class AuthController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/authorize",       this.authorize)
            .post("/token",          this.formParser, this.token)
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

    private token(req: Request, res: Response) {
        if (req.body.grant_type === "authorization_code" ||
            req.body.grant_type === "password" ||
            req.body.grant_type === "client_credentials" ||
            req.body.grant_type === "refresh_token") {
            res.send({
                access_token: "abcdef",
                token_type: "bearer",
                expires_in: 3600,
                refresh_token: "ghijkl",
            });
        } else {
            res
                .status(HttpStatus.BAD_REQUEST)
                .send({
                    error: "invalid_request",
                });
        }
    }

    private async resetPassword(req: Request, res: Response) {
        await UserService.resetUserPassword(req.body);
        res
            .status(HttpStatus.ACCEPTED)
            .send({});
    }

}
