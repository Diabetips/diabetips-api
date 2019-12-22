/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import { Request, Response } from "express";

import { BaseController } from "./BaseController";

const IMG_PLACEHOLDER = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64");

export class UserPhotoController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:uid/photo",       this.getUserPhoto)
            .post("/:uid/photo",    this.uploadUserPhoto);
    }

    private async getUserPhoto(req: Request, res: Response) {
        res
            .contentType("png")
            .send(IMG_PLACEHOLDER);
    }

    private async uploadUserPhoto(req: Request, res: Response) {
        res
            .contentType("png")
            .send(IMG_PLACEHOLDER);
    }

}
