/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Aug 31 2019
*/

import bodyParser = require("body-parser");
import querystring = require("querystring");

import { NextFunction, Request, Response } from "express";
import { Body, Ctx, Get, HttpCode, JsonController, Post, Redirect, Req, UseAfter,
    UseBefore } from "routing-controllers";

import { config } from "../config";
import { AuthError } from "../errors";
import { Context, HttpStatus } from "../lib";
import { logger } from "../logger";
import { UserConfirmAccountReq, UserResetPasswordReq } from "../requests";
import { AuthService, UserConfirmationService, UserService } from "../services";

@JsonController("/v1/auth")
export class AuthController {

    private static formParser = bodyParser.urlencoded({ extended: true });

    // OAuth routes specific error response formatting
    private static errorHandler(err: Error | AuthError, req: Request, res: Response, next: NextFunction) {
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

    @Get("/authorize")
    @Redirect(config.diabetips.accountUrl + "/oauth/authorize?:query")
    private authorizeRedirect(@Req() req: Request) {
        return {
            query: querystring.stringify(req.query),
        };
    }

    @Post("/authorize")
    @UseBefore(AuthController.formParser)
    @UseAfter(AuthController.errorHandler)
    private async authorize(@Ctx() context: Context, @Body() body: any) {
        return AuthService.authorize(context, body);
    }

    @Post("/token")
    @UseBefore(AuthController.formParser)
    @UseAfter(AuthController.errorHandler)
    private async token(@Ctx() context: Context, @Body() body: any) {
        return AuthService.getToken(context, body);
    }

    @Post("/confirm")
    private async confirmAccount(@Body() req: UserConfirmAccountReq) {
        await UserConfirmationService.confirmUserAccount(req);
    }

    @Post("/reset-password")
    @HttpCode(HttpStatus.ACCEPTED)
    private async resetPassword(@Body() req: UserResetPasswordReq) {
        // await voluntarly missing in order to prevent timing attacks
        // Measuring the time this route takes to respond could otherwise be used by an attacker to reveal whether a
        // given email address is associated to an account.
        // The async function is queued but not awaited so that it runs in the background while the response is sent
        // immediately.
        UserService.resetUserPassword(req);
        return {};
    }

}
