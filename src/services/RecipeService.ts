/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Recipe } from "../entities/Recipe";
import { ApiError, BaseService, HttpStatus } from "./BaseService";

export interface ICreateRecipeRequest {
    name: string;
    description: string;
    // TODO: Add ingredients
    // ingredients: Ingredient[];
}

export interface IUpdateRecipeRequest {
    name?: string;
    description?: string;
    // TODO: Add ingredients
    // ingredients: Ingredient[];
}

export class RecipeService extends BaseService {

    public static async getAllRecipes(query: any): Promise<Recipe[]> {
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
        // TODO
        // * Add ingredients
        // ? Only ask for ingredient ID + quantity in the payload ?
        //   There's no point in sending the whole ingredient when you think about it
        //   Although it would save DB requests I guess, idk you'll figure it out :)
        const recipe = new Recipe();

        recipe.name = req.name;
        recipe.description = req.description;

        return recipe.save();
    }

    public static async updateRecipe(id: number, req: IUpdateRecipeRequest): Promise<Recipe> {
        // TODO
        // * Add ingredients
        // ? Allow change of name / description ?
        // ? Only allow creator/admin to have the right to update ?
        const recipe = await Recipe.findById(id);

        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }

        if (req.name !== undefined) { recipe.name = req.name; }
        if (req.description !== undefined) { recipe.description = req.description; }

        return recipe.save();
    }

    public static async deleteRecipe(id: number): Promise<void> {
        const recipe = await this.getRecipe(id);
        recipe.deleted = true;
        recipe.save();
    }
}
