/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import createHttpError = require("http-errors");

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { AuthAppLogoService } from "../services";

import { BaseController } from "./BaseController";

export class AuthAppLogoController extends BaseController {

    constructor() {
        super({
            rawParserOptions: {
                limit: "2mb",
                type: (req) => {
                    if (req.headers["content-type"] !== "image/png") {
                        throw createHttpError(415);
                    }
                    return true;
                },
            },
        });

        this.router
            .get("/:appid/logo",                  this.getAppLogo)
            .post("/:appid/logo", this.rawParser, this.uploadAppLogo);
    }

    private async getAppLogo(req: Request, res: Response) {
        res
            .contentType("png")
            .send(await AuthAppLogoService.getAppLogo(req.params.appid));
    }

    private async uploadAppLogo(req: Request, res: Response) {
        await AuthAppLogoService.setAppLogo(req.params.appid, req.body);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
