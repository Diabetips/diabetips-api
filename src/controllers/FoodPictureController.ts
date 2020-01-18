/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Jan 18 2020
*/

import { Request, Response } from "express";

import { FoodPictureService } from "../services";

import { BaseController } from "./BaseController";

export class FoodPictureController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:id/picture", this.getFoodPicture);
    }

    private async getFoodPicture(req: Request, res: Response) {
        res
            .type("jpeg")
            .send(await FoodPictureService.getFoodPicture(parseInt(req.params.id, 10)));
    }

}
