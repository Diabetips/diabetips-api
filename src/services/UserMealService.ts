/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Recipe, User } from "../entities";
import { IUserMealSearchRequest, UserMeal } from "../entities/UserMeal";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { BaseService } from "./BaseService";

interface ICreateUserMealRequest {
    description: string;
    recipeIDs: number[];
}

interface IUpdateUserMealRequest {
    description?: string;
    recipeIDs?: number[];
}

export class UserMealService extends BaseService {

    public static async getAllUserMeals(patientUid: string, query: IUserMealSearchRequest): Promise<UserMeal[]> {
        // TODO: pagination in the future ?
        return UserMeal.findAll(patientUid);
    }

    public static async getUserMeal(params: IUserMealParams) {
        const meal = UserMeal.findById(params.userUid, params.mealId);
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal ${params.mealId} not found`);
        }
        return meal;
    }

    public static async addUserMeal(patientUid: string, req: ICreateUserMealRequest): Promise<UserMeal> {
        // Get the user
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        // Add meal
        const meal = new UserMeal();
        meal.description = req.description;
        meal.user = user;
        meal.recipes = [];

        for (const recipeID of req.recipeIDs) {
            const r = await Recipe.findById(recipeID);
            if (r === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeID}) not found`);
            }
            meal.recipes.push(r);
        }

        return meal.save();
    }

    public static async updateUserMeal(params: IUserMealParams, req: IUpdateUserMealRequest): Promise<UserMeal> {
        const meal = await UserMeal.findById(params.userUid, params.mealId);

        // TODO? might have to change the error on that one ?
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${params.mealId}) or User (${params.userUid}) not found`);
        }

        if (req.description !== undefined) { meal.description = req.description; }
        if (req.recipeIDs !== undefined) {
            meal.recipes = [];

            for (const recipeID of req.recipeIDs) {
                const r = await Recipe.findById(recipeID);
                if (r === undefined) {
                    throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeID}) not found`);
                }
                meal.recipes.push(r);
            }
        }

        return meal.save();
    }

    public static async deleteUserMeal(params: IUserMealParams): Promise<UserMeal> {
        const meal = await UserMeal.findById(params.userUid, params.mealId);

        // TODO? might have to change the error on that one ?
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${params.mealId}) or User (${params.userUid}) not found`);
        }

        meal.deleted = true;
        return meal.save();
    }

}

interface IUserMealParams {
    userUid: string;
    mealId: number;
}
