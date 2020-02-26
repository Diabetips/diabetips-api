/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Pageable } from "../lib";
import { MealCreateReq, MealUpdateReq } from "../requests";
import { MealService } from "../services";

@JsonController("/v1/users/:uid/meals")
export class UserMealController {

    @Get("/")
    private async getAllUserMeals(@Param("uid") uid: string, @QueryParams() p: Pageable, @Res() res: Response) {
        const page = await MealService.getAllMeals(uid, p);
        return page.send(res);
    }

    @Post("/")
    private async addUserMeal(@Param("uid") uid: string, @Body() body: MealCreateReq) {
        return MealService.addMeal(uid, body);
    }

    @Get("/:id")
    private async getUserMeal(@Param("uid") uid: string, @Param("id") mealId: number) {
        return MealService.getMeal(uid, mealId);
    }

    @Put("/:id")
    private async updateUserMeal(@Param("uid") uid: string, @Param("id") mealId: number, @Body() body: MealUpdateReq) {
        return MealService.updateMeal(uid, mealId, body);
    }

    @Delete("/:id")
    private async deleteUserMeal(@Param("uid") uid: string, @Param("id") mealId: number) {
        await MealService.deleteMeal(uid, mealId);
    }

}
