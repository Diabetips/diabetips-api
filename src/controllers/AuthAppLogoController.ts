/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import bodyParser = require("body-parser");
import createHttpError = require("http-errors");

import { Body, ContentType, Controller, Get, Param, Post, UseBefore } from "routing-controllers";

import { HttpStatus } from "../lib";
import { AuthAppLogoService } from "../services";

@Controller("/v1/auth/apps/:appid/logo")
export class AuthAppLogoController {

    private static rawParser = bodyParser.raw({
        limit: "2mb",
        type: (req) => {
            if (req.headers["content-type"] !== "image/png") {
                throw createHttpError(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
            }
            return true;
        },
    });

    @Get("/")
    @ContentType("png")
    public async getAppLogo(@Param("appid") appid: string) {
        return AuthAppLogoService.getAppLogo(appid);
    }

    @Post("/")
    @UseBefore(AuthAppLogoController.rawParser)
    public async uploadAppLogo(@Param("appid") appid: string, @Body() body: Buffer) {
        await AuthAppLogoService.setAppLogo(appid, body);
    }

}
