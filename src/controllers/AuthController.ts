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
import { Body, Ctx, Get, HttpCode, JsonController, Param, Post, Put, Redirect, Req, UseAfter, UseBefore } from "routing-controllers";

import { config } from "../config";
import { AuthError } from "../errors";
import { Authorized, Context, HttpStatus } from "../lib";
import { logger } from "../logger";
import { UserConfirmAccountReq, UserResetPasswordReq1, UserResetPasswordReq2 } from "../requests";
import { AuthService, AuthAppService, UserConfirmationService, UserResetPasswordService } from "../services";

@JsonController("/v1/auth")
export class AuthController {

    private static formParser = bodyParser.urlencoded({ extended: true });

    // OAuth routes specific error response formatting
    private static errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
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
    public authorizeRedirect(@Req() req: Request) {
        return {
            query: querystring.stringify(req.query as { [key: string]: string }),
        };
    }

    // INTERNAL
    @Post("/authorize")
    @UseBefore(AuthController.formParser)
    @UseAfter(AuthController.errorHandler)
    @Authorized("auth:authorize")
    public async authorize(@Ctx() context: Context, @Body() body: any) {
        return AuthService.authorize(context, body);
    }

    @Post("/token")
    @UseBefore(AuthController.formParser)
    @UseAfter(AuthController.errorHandler)
    public async token(@Ctx() context: Context, @Body() body: any) {
        return AuthService.getToken(context, body);
    }

    @Post("/revoke")
    @UseBefore(AuthController.formParser)
    @UseAfter(AuthController.errorHandler)
    public async revoke(@Ctx() context: Context, @Body() body: any) {
        await AuthService.revokeToken(context, body);
        return {};
    }

    // INTERNAL
    @Get("/client/:client_id")
    @Authorized("auth:authorize")
    public async getClientManifest(@Param("client_id") clientId: string) {
        return AuthAppService.getClientManifest(clientId);
    }

    // INTERNAL
    @Post("/confirm")
    @Authorized("auth:confirm")
    public async confirmAccount(@Body() req: UserConfirmAccountReq) {
        await UserConfirmationService.confirmUserAccount(req);
    }

    @Post("/reset-password")
    @HttpCode(HttpStatus.ACCEPTED)
    @Authorized("auth:reset")
    public async resetPassword1(@Body() req: UserResetPasswordReq1) {
        // No await here, the route should respond immediately instead of waiting for the password reset request to be
        // processed. This prevent time attacks that could leak whether a given email address has been used to register
        // an account
        UserResetPasswordService.resetPassword1(req);
    }

    // INTERNAL
    @Put("/reset-password")
    @Authorized("auth:reset2")
    public async resetPassword2(@Body() req: UserResetPasswordReq2) {
        await UserResetPasswordService.resetPassword2(req);
    }

}
