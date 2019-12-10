/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Food, Ingredient, IRecipeSearchRequest, Recipe } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { BaseService } from "./BaseService";

interface IIngredientRequest {
    foodID: number;
    quantity: number;
}

export interface ICreateRecipeRequest {
    name: string;
    description: string;
    ingredients: IIngredientRequest[];
}

export interface IUpdateRecipeRequest {
    name?: string;
    description?: string;
    ingredients?: IIngredientRequest[];
}

export class RecipeService extends BaseService {

    public static async getAllRecipes(query: IRecipeSearchRequest = {}): Promise<Recipe[]> {
        return Recipe.findAll(query);
    }

    public static async getRecipe(id: number): Promise<Recipe> {
        const recipe = await Recipe.findById(id);
        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }
        return recipe;
    }

    public static async createRecipe(req: ICreateRecipeRequest): Promise<Recipe> {
        const recipe = new Recipe();

        recipe.name = req.name;
        recipe.description = req.description;
        recipe.ingredients = [];
        for (const ingReq of req.ingredients) {
            const f = await Food.findById(ingReq.foodID);
            if (f === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.foodID}) not found`);
            }
            const ing = new Ingredient();
            ing.quantity = ingReq.quantity;
            ing.food = f;
            recipe.ingredients.push(ing);
        }

        return recipe.save();
    }

    public static async updateRecipe(id: number, req: IUpdateRecipeRequest): Promise<Recipe> {
        // TODO
        // ? Allow change of name / description ?
        // ? Only allow creator/admin to have the right to update ?
        const recipe = await Recipe.findById(id);

        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }

        if (req.name !== undefined) { recipe.name = req.name; }
        if (req.description !== undefined) { recipe.description = req.description; }
        if (req.ingredients !== undefined) {
            recipe.ingredients = [];
            for (const ingReq of req.ingredients) {
                const f = await Food.findById(ingReq.foodID);
                if (f === undefined) {
                    throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.foodID}) not found`);
                }
                const ing = new Ingredient();
                ing.quantity = ingReq.quantity;
                ing.food = f;
                recipe.ingredients.push(ing);
            }
        }
        return recipe.save();
    }

    public static async deleteRecipe(id: number): Promise<void> {
        const recipe = await this.getRecipe(id);
        recipe.deleted = true;
        recipe.save();
    }
}
