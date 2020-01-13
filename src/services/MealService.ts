/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { IMealSearchRequest, Meal, Recipe, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";

interface ICreateMealRequest {
    description: string;
    recipes_ids: number[];
}

interface IUpdateMealRequest {
    description?: string;
    recipes_ids?: number[];
}

export class MealService extends BaseService {

    public static async getAllMeals(patientUid: string, query: IMealSearchRequest): Promise<Meal[]> {
        return Meal.findAll(patientUid, query);
    }

    public static async getMeal(params: IMealParams): Promise<Meal> {
        const meal = await Meal.findById(params.userUid, params.mealId);
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal ${params.mealId} not found`);
        }
        return meal;
    }

    public static async addMeal(patientUid: string, req: ICreateMealRequest): Promise<Meal> {
        // Get the user
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        // Add meal
        const meal = new Meal();
        meal.description = req.description;
        meal.user = user;
        meal.recipes = [];

        for (const recipeID of req.recipes_ids) {
            const r = await Recipe.findById(recipeID);
            if (r === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeID}) not found`);
            }
            meal.recipes.push(r);
        }

        return meal.save();
    }

    public static async updateMeal(params: IMealParams, req: IUpdateMealRequest): Promise<Meal> {
        const meal = await Meal.findById(params.userUid, params.mealId);

        // TODO? might have to change the error on that one ?
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${params.mealId}) or User (${params.userUid}) not found`);
        }

        if (req.description !== undefined) { meal.description = req.description; }
        if (req.recipes_ids !== undefined) {
            meal.recipes = [];

            for (const recipeID of req.recipes_ids) {
                const r = await Recipe.findById(recipeID);
                if (r === undefined) {
                    throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeID}) not found`);
                }
                meal.recipes.push(r);
            }
        }

        return meal.save();
    }

    public static async deleteMeal(params: IMealParams): Promise<Meal> {
        const meal = await Meal.findById(params.userUid, params.mealId);

        // TODO? might have to change the error on that one ?
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${params.mealId}) or User (${params.userUid}) not found`);
        }

        meal.deleted = true;
        return meal.save();
    }

}

interface IMealParams {
    userUid: string;
    mealId: number;
}
