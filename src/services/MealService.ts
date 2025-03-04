/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Meal, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { MealCreateReq, MealUpdateReq } from "../requests";

import { BaseService } from "./BaseService";

export class MealService extends BaseService {

    public static async getAllMeals(uid: string, p: Pageable, t: Timeable): Promise<Page<Meal>> {
        return Meal.findAll(uid, p, t);
    }

    public static async getMeal(uid: string, mealId: number): Promise<Meal> {
        const meal = await Meal.findById(uid, mealId);
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal ${mealId} not found`);
        }
        return meal;
    }

    public static async addMeal(uid: string, req: MealCreateReq): Promise<Meal> {
        // Get the user
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        // Add meal
        const meal = new Meal();
        meal.description = req.description;
        meal.time = req.time;
        meal.user = Promise.resolve(user);
        meal.recipes = [];
        meal.foods = [];

        if (req.recipes !== undefined) { await meal.addRecipes(req.recipes); }
        if (req.foods !== undefined) { await meal.addFoods(req.foods); }

        if (!meal.isValid()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "empty_meal", `A meal must contain at least one recipe or one food`);
        }
        meal.computeNutritionDataTotals();

        return meal.save();
    }

    public static async updateMeal(uid: string, mealId: number, req: MealUpdateReq): Promise<Meal> {
        const meal = await Meal.findById(uid, mealId);

        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${mealId}) or User (${uid}) not found`);
        }

        if (req.description !== undefined) { meal.description = req.description; }
        if (req.time !== undefined) { meal.time = req.time; }
        if (req.recipes !== undefined) {
            meal.recipes = [];
            await meal.addRecipes(req.recipes);
        }
        if (req.foods !== undefined) {
            meal.foods = [];
            await meal.addFoods(req.foods);
        }

        if (!meal.isValid()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "empty_meal", `A meal must contain at least one recipe or one food`);
        }

        meal.computeNutritionDataTotals();
        return meal.save();
    }

    public static async deleteMeal(uid: string, mealId: number): Promise<Meal> {
        const meal = await Meal.findById(uid, mealId);

        // TODO? might have to change the error on that one ?
        if (meal === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "meal_not_found", `Meal (${mealId}) or User (${uid}) not found`);
        }

        meal.deleted = true;
        return meal.save();
    }

}
