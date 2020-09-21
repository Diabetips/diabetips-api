/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Food, Ingredient, Recipe } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Context } from "../lib";
import { RecipeCreateReq, RecipeSearchReq, RecipeUpdateReq } from "../requests";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class RecipeService extends BaseService {

    public static async getAllRecipes(p: Pageable,
                                      s: RecipeSearchReq):
                                      Promise<Page<Recipe>> {
        return Recipe.findAll(p, s);
    }

    public static async getRecipe(id: number): Promise<Recipe> {
        const recipe = await Recipe.findById(id);
        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }
        return recipe;
    }

    public static async createRecipe(req: RecipeCreateReq, context: Context): Promise<Recipe> {
        let author;
        try {
            author = await UserService.getCurrentUser(context);
        } catch {
            author = null;
        }

        const recipe = new Recipe();

        recipe.name = req.name;
        recipe.description = req.description;
        recipe.ingredients = [];
        recipe.portions_eaten = 0;

        recipe.total_energy = 0;
        recipe.total_carbohydrates = 0;
        recipe.total_sugars = 0;
        recipe.total_fat = 0;
        recipe.total_saturated_fat = 0;
        recipe.total_fiber = 0;
        recipe.total_proteins = 0;

        recipe.portions = req.portions;
        recipe.author = author;

        for (const ingReq of req.ingredients) {
            const ing = new Ingredient();
            await ing.init(ingReq);

            recipe.total_energy += ing.total_energy;
            recipe.total_carbohydrates += ing.total_carbohydrates;
            recipe.total_sugars += ing.total_sugars;
            recipe.total_fat += ing.total_fat;
            recipe.total_saturated_fat += ing.total_saturated_fat;
            recipe.total_fiber += ing.total_fiber;
            recipe.total_proteins += ing.total_proteins;

            recipe.ingredients.push(ing);
        }

        return recipe.save();
    }

    public static async updateRecipe(id: number, req: RecipeUpdateReq): Promise<Recipe> {
        // TODO
        // ? Allow change of name / description ?
        // ? Only allow creator/admin to have the right to update ?
        const recipe = await Recipe.findById(id);

        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }

        if (req.name !== undefined) { recipe.name = req.name; }
        if (req.description !== undefined) { recipe.description = req.description; }
        if (req.portions !== undefined) { recipe.portions = req.portions; }
        if (req.ingredients !== undefined) {
            recipe.ingredients = [];

            recipe.total_energy = 0;
            recipe.total_carbohydrates = 0;
            recipe.total_sugars = 0;
            recipe.total_fat = 0;
            recipe.total_saturated_fat = 0;
            recipe.total_fiber = 0;
            recipe.total_proteins = 0;

            for (const ingReq of req.ingredients) {
                const f = await Food.findById(ingReq.food_id);
                if (f === undefined) {
                    throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.food_id}) not found`);
                }
                const ing = new Ingredient();
                ing.quantity = ingReq.quantity;
                ing.food = f;
                ing.computeNutritionDataTotals();

                recipe.total_energy += ing.total_energy;
                recipe.total_carbohydrates += ing.total_carbohydrates;
                recipe.total_sugars += ing.total_sugars;
                recipe.total_fat += ing.total_fat;
                recipe.total_saturated_fat += ing.total_saturated_fat;
                recipe.total_fiber += ing.total_fiber;
                recipe.total_proteins += ing.total_proteins;

                recipe.ingredients.push(ing);
            }
        }
        return recipe.save();
    }

    public static async deleteRecipe(id: number): Promise<void> {
        const recipe = await this.getRecipe(id);
        if (recipe === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe ${id} not found`);
        }
        recipe.deleted = true;
        await recipe.save();
    }

    // Favorite recipes

    public static async getFavoriteRecipes(uid: string, p: Pageable): Promise<Recipe[]> {
        const user = await UserService.getUser(uid);
        return user.favoriteRecipes;
    }

    public static async addFavoriteRecipe(uid: string, id: number) {
        const user = await UserService.getUser(uid);
        const newFavorite = await this.getRecipe(id);
        const favorites = await user.favoriteRecipes;

        if (favorites.find((recipe) => recipe.id === id) !== undefined) {
            return;
        }

        user.favoriteRecipes = Promise.resolve(favorites.concat(newFavorite));
        await user.save();
    }

    public static async removeFavoriteRecipe(uid: string, id: number) {
        const user = await UserService.getUser(uid);
        const favorites = await user.favoriteRecipes;

        user.favoriteRecipes = Promise.resolve(favorites.filter((recipe) => recipe.id !== id));
        await user.save();
    }
}
