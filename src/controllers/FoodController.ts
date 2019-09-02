/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";
import { BaseController } from "./BaseController";

export class FoodController extends BaseController {

    public static tmpCucumber = {
        id: 15,
        name: "Concombre",
        unit: "g",
    };

    public static tmpCream = {
        id: 59,
        name: "Crème Fraîche",
        unit: "mL",
    };

    constructor() {
        super();

        this.router
            .get("/", this.getAllFood)
            .get("/:id", this.getFood);
    }

    private getAllFood(req: Request, res: Response) {
        // TODO: Do the logic
        // TODO: Need pagination
        // TODO: Need to add filtering/searching
        res.send([
            FoodController.tmpCucumber,
            FoodController.tmpCream,
        ]);
    }

    private getFood(req: Request, res: Response) {
        // TODO: Do the logic
        res.send(FoodController.tmpCucumber);
    }
}
