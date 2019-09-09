/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { RecipeController } from ".";
import { UserMealService } from "../services/UserMealService";
import { BaseController, HttpStatus } from "./BaseController";

export class UserMealController extends BaseController {

    // TODO: remove this
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
            .get("/:userUid/meals/", this.getAllUserMeals)
            .post("/:userUid/meals/", this.addUserMeal)
            .get("/:userUid/meals/:id", this.getUserMeal)
            .put("/:userUid/meals/:id", this.updateUserMeal)
            .delete("/:userUid/meals/:id", this.deleteUserMeal);
    }

    private async getAllUserMeals(req: Request, res: Response) {
        res.send(await UserMealService.getAllUserMeals(req.params.useruid, req.query));
    }

    private async getUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        res.send(await UserMealService.getUserMeal(params));
    }

    private async addUserMeal(req: Request, res: Response) {
        res.send(await UserMealService.addUserMeal(req.params.useruid, req.body));
    }

    private async updateUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        res.send(await UserMealService.updateUserMeal(params, req.body));
    }

    private async deleteUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        await UserMealService.deleteUserMeal(params);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
