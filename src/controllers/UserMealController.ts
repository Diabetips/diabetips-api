/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { RecipeController } from ".";
import { BaseController, HttpStatus } from "./BaseController";

export class UserMealController extends BaseController {

    private static tmpMeal = {
        id: 2,
        time: "some timestamp here",
        description: "some description",
        recipes: [
            RecipeController.tmpSalad,
            RecipeController.tmpSalad,
        ],
    };

    constructor() {
        super();

        this.router
            .get("/:useruid/meals/", this.getUserMeals)
            .post("/:useruid/meals/", this.addUserMeal)
            .get("/:useruid/meals/:id", this.getUserMeal)
            .put("/:useruid/meals/:id", this.updateUserMeal)
            .delete("/:useruid/meals/:id", this.deleteUserMeal);
    }

    private getUserMeals(req: Request, res: Response) {
        res.send([
            UserMealController.tmpMeal,
            UserMealController.tmpMeal,
        ]);
    }

    private getUserMeal(req: Request, res: Response) {
        res.send(UserMealController.tmpMeal);
    }

    private addUserMeal(req: Request, res: Response) {
        res.send(UserMealController.tmpMeal);
    }

    private updateUserMeal(req: Request, res: Response) {
        res.send(UserMealController.tmpMeal);
    }

    private deleteUserMeal(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
