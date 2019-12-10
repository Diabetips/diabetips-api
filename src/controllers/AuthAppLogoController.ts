/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import { Request, Response } from "express";

import { BaseController } from "./BaseController";

const IMG_PLACEHOLDER = new Buffer("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64");

export class AuthAppLogoController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:appid/logo",       this.getAppLogo)
            .post("/:appid/logo",    this.uploadAppLogo);
    }

    private async getAppLogo(req: Request, res: Response) {
        res
        .contentType("png")
        .send(IMG_PLACEHOLDER);
    }

    private async uploadAppLogo(req: Request, res: Response) {
        res
        .contentType("png")
        .send(IMG_PLACEHOLDER);
    }

}
