/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { UserPictureService } from "../services";

import { BaseController } from "./BaseController";

export class UserPictureController extends BaseController {

    constructor() {
        super({
            rawParserOptions: {
                limit: "5mb",
                type: () => true,
            },
        });

        this.router
            .get("/:uid/picture",                  this.getUserPicture)
            .post("/:uid/picture", this.rawParser, this.setUserPicture);
    }

    private async getUserPicture(req: Request, res: Response) {
        res
            .contentType("jpeg")
            .send(await UserPictureService.getUserPicture(req.params.uid));
    }

    private async setUserPicture(req: Request, res: Response) {
        await UserPictureService.setUserPicture(req.params.uid, req.body);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
