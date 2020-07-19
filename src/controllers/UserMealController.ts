/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable, Timeable } from "../lib";
import { MealCreateReq, MealUpdateReq } from "../requests";
import { MealService } from "../services";

@JsonController("/v1/users/:uid/meals")
export class UserMealController {

    @Get("/")
    @Authorized("user.meals:read")
    public async getAllUserMeals(@Param("uid") uid: string,
                                 @QueryParams() p: Pageable,
                                 @QueryParams() t: Timeable,
                                 @Res() res: Response) {
        const page = await MealService.getAllMeals(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    @Authorized("user.meals:write")
    public async addUserMeal(@Param("uid") uid: string, @Body() body: MealCreateReq) {
        return MealService.addMeal(uid, body);
    }

    @Get("/:id")
    @Authorized("user.meals:read")
    public async getUserMeal(@Param("uid") uid: string, @Param("id") mealId: number) {
        return MealService.getMeal(uid, mealId);
    }

    @Put("/:id")
    @Authorized("user.meals:write")
    public async updateUserMeal(@Param("uid") uid: string, @Param("id") mealId: number, @Body() body: MealUpdateReq) {
        return MealService.updateMeal(uid, mealId, body);
    }

    @Delete("/:id")
    @Authorized("user.meals:write")
    public async deleteUserMeal(@Param("uid") uid: string, @Param("id") mealId: number) {
        await MealService.deleteMeal(uid, mealId);
    }

}
