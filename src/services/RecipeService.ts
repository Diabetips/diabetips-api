/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Food, Ingredient, IRecipeSearchRequest, Recipe } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";

import { BaseService } from "./BaseService";

interface IIngredientRequest {
    food_id: number;
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

    public static async getAllRecipes(p: Pageable, req: IRecipeSearchRequest): Promise<Page<Recipe>> {
        return Recipe.findAll(p, req);
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
        recipe.total_sugar = 0;
        for (const ingReq of req.ingredients) {
            const f = await Food.findById(ingReq.food_id);
            if (f === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.food_id}) not found`);
            }
            const ing = new Ingredient();
            ing.quantity = ingReq.quantity;
            ing.food = f;
            ing.total_sugar = ing.quantity * f.sugars_100g / 100;
            recipe.total_sugar += ing.total_sugar;
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
            recipe.total_sugar = 0;
            for (const ingReq of req.ingredients) {
                const f = await Food.findById(ingReq.food_id);
                if (f === undefined) {
                    throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.food_id}) not found`);
                }
                const ing = new Ingredient();
                ing.quantity = ingReq.quantity;
                ing.food = f;
                ing.total_sugar = ing.quantity * f.sugars_100g / 100;
                recipe.total_sugar += ing.total_sugar;
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
