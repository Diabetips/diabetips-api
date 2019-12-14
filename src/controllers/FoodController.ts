/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { FoodService } from "../services/FoodService";

import { BaseController } from "./BaseController";

export class FoodController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/", this.getAllFood)
            .get("/:id", this.getFood)
            // TODO: Remove temporary route
            .post("/", this.jsonParser, this.addFood);
    }

    private async getAllFood(req: Request, res: Response) {
        res.send(await FoodService.getAllFood(req.query));
    }

    private async getFood(req: Request, res: Response) {
        res.send(await FoodService.getFood(parseInt(req.params.id, 10)));
    }

    private async addFood(req: Request, res: Response) {
        res.send(await FoodService.addFood(req.body));
    }
}
