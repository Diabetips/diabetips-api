/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { HttpStatus, Page, Pageable } from "../lib";
import { MealService } from "../services";

import { BaseController } from "./BaseController";

export class UserMealController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:userUid/meals/",                        this.getAllUserMeals)
            .post("/:userUid/meals/",      this.jsonParser, this.addUserMeal)
            .get("/:userUid/meals/:id",                     this.getUserMeal)
            .put("/:userUid/meals/:id",    this.jsonParser, this.updateUserMeal)
            .delete("/:userUid/meals/:id",                  this.deleteUserMeal);
    }

    private async getAllUserMeals(req: Request, res: Response) {
        const page = await MealService.getAllMeals(req.params.userUid, new Pageable(req.query));
        page.sendAs(res);
    }

    private async getUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.id, 10),
        };

        res.send(await MealService.getMeal(params));
    }

    private async addUserMeal(req: Request, res: Response) {
        res.send(await MealService.addMeal(req.params.userUid, req.body));
    }

    private async updateUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.id, 10),
        };

        res.send(await MealService.updateMeal(params, req.body));
    }

    private async deleteUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.id, 10),
        };

        await MealService.deleteMeal(params);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
