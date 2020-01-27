/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { Pageable } from "../lib";
import { FoodService } from "../services";

import { BaseController } from "./BaseController";

export class FoodController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",    this.getAllFood)
            .get("/:id", this.getFood);
    }

    private async getAllFood(req: Request, res: Response) {
        const page = await FoodService.getAllFood(new Pageable(req.query), req.query);
        page.sendAs(res);
    }

    private async getFood(req: Request, res: Response) {
        res.send(await FoodService.getFood(parseInt(req.params.id, 10)));
    }

}
