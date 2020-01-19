/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { FoodService } from "../services";

import { getPageHeader } from "../entities/BaseEntity";
import { BaseController } from "./BaseController";

export class FoodController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",    this.getAllFood)
            .get("/:id", this.getFood)
    }

    private async getAllFood(req: Request, res: Response) {
        const [food, count] = await FoodService.getAllFood(req.query);
        const header = getPageHeader(await count, req.query);

        res.setHeader("X-Pages", header);
        res.send(await food);
    }

    private async getFood(req: Request, res: Response) {
        res.send(await FoodService.getFood(parseInt(req.params.id, 10)));
    }

}
