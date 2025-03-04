/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, SelectQueryBuilder } from "typeorm";

import { HttpStatus, Page, Pageable, Timeable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { Food, MealFood, MealRecipe, Recipe, User } from ".";
import { ApiError } from "../errors";
import { MealFoodReq, MealRecipeReq } from "../requests";

@Entity()
export class Meal extends BaseEntity {

    @ManyToOne(() => User, (user) => user.meals, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @Column({ length: 200 })
    public description: string;

    @Column({ type: "float" })
    public total_energy: number;

    @Column({ type: "float" })
    public total_carbohydrates: number;

    @Column({ type: "float" })
    public total_sugars: number;

    @Column({ type: "float" })
    public total_fat: number;

    @Column({ type: "float" })
    public total_saturated_fat: number;

    @Column({ type: "float" })
    public total_fiber: number;

    @Column({ type: "float" })
    public total_proteins: number;

    @Column()
    public time: Date;

    @OneToMany(() => MealRecipe, (recipe) => recipe.meal, { cascade: true })
    public recipes: MealRecipe[];

    @OneToMany(() => MealFood, (food) => food.meal, { cascade: true })
    public foods: MealFood[];

    // Repository functions

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IMealQueryOptions = {}):
                                Promise<Page<Meal>> {
        const subq = (sqb: SelectQueryBuilder<Meal>) => {
            let subqb = sqb
                .select("meal.id")
                .leftJoin("meal.user", "user")
                .where("user.uid = :uid", { uid })

            if (Utils.optionDefault(options.hideDeleted, true)) {
                subqb = subqb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false");
            }

            return subqb;
        };

        let qb = this
            .createQueryBuilder("meal")
            .where((sqb) => "meal.id IN " + p.limit(subq(sqb.subQuery().from("meal", "meal"))).getQuery())
            .orderBy("meal.time", "DESC");

        qb = this.getFullMealQuery(qb);

        return p.queryWithCountQuery(t.applyTimeRange(qb), subq(this.createQueryBuilder("meal")));
    }

    public static findById(uid: string,
                           mealId: number,
                           options: IMealQueryOptions = {}):
                           Promise<Meal | undefined> {
        let qb = this
            .createQueryBuilder("meal")
            .where("user.uid = :uid", { uid })
            .andWhere("meal.id = :mealId", { mealId });

        qb = this.getFullMealQuery(qb);
        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false")
        }

        return qb.getOne();
    }

    private static getFullMealQuery(query: SelectQueryBuilder<Meal>): SelectQueryBuilder<Meal> {
        return query
            // Meal Recipes
            .leftJoinAndSelect("meal.recipes", "meal_recipes")
            // Recipe
            .leftJoinAndSelect("meal_recipes.recipe", "recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredient")
            .leftJoinAndSelect("ingredient.food", "recipe_food")
            // Modifications
            .leftJoinAndSelect("meal_recipes.modifications", "modifications")
            .leftJoinAndSelect("modifications.food", "modified_food")
            // Foods
            .leftJoinAndSelect("meal.foods", "meal_foods")
            .leftJoinAndSelect("meal_foods.food", "independent_food")
            .leftJoin("meal.user", "user");
    }

    public async addRecipes(recipes: MealRecipeReq[]) {
        for (const recipeReq of recipes) {
            const r = await Recipe.findById(recipeReq.id);
            if (r === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeReq.id}) not found`);
            }
            const mealRecipe = new MealRecipe();

            mealRecipe.recipe = r;
            mealRecipe.modifications = [];
            mealRecipe.portions_eaten = recipeReq.portions_eaten;
            if (recipeReq.modifications !== undefined) {
                await mealRecipe.addModifications(recipeReq.modifications);
            }
            this.recipes.push(mealRecipe);
        }
    }

    public async addFoods(mealFoodReq: MealFoodReq[]) {
        for (const f of mealFoodReq) {
            const food = await Food.findById(f.id);
            if (food === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${f.id}) not found`);
            }
            const mealFood = new MealFood();
            mealFood.food = food;
            mealFood.quantity = f.quantity;

            mealFood.total_energy        = (food.energy_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_carbohydrates = (food.carbohydrates_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_sugars        = (food.sugars_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_fat           = (food.fat_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_saturated_fat = (food.saturated_fat_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_fiber         = (food.fiber_100g ?? 0) / 100 * mealFood.quantity;
            mealFood.total_proteins      = (food.proteins_100g ?? 0) / 100 * mealFood.quantity;

            this.foods.push(mealFood);
        }
    }

    public computeNutritionDataTotals() {
        this.total_energy = 0;
        this.total_carbohydrates = 0;
        this.total_sugars = 0;
        this.total_fat = 0;
        this.total_saturated_fat = 0;
        this.total_fiber = 0;
        this.total_proteins = 0;

        for (const recipe of this.recipes) {
            recipe.computeNutritionDataTotals();
            this.total_energy += recipe.total_energy;
            this.total_carbohydrates += recipe.total_carbohydrates;
            this.total_sugars += recipe.total_sugars;
            this.total_fat += recipe.total_fat;
            this.total_saturated_fat += recipe.total_saturated_fat;
            this.total_fiber += recipe.total_fiber;
            this.total_proteins += recipe.total_proteins;
        }
        for (const food of this.foods) {
            this.total_energy += food.total_energy;
            this.total_carbohydrates += food.total_carbohydrates;
            this.total_sugars += food.total_sugars;
            this.total_fat += food.total_fat;
            this.total_saturated_fat += food.total_saturated_fat;
            this.total_fiber += food.total_fiber;
            this.total_proteins += food.total_proteins;
        }
    }

    public isValid(): boolean {
        return this.recipes.length !== 0 || this.foods.length !== 0;
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IMealQueryOptions extends IBaseQueryOptions {
}
