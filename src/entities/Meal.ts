/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, SelectQueryBuilder } from "typeorm";

import { HttpStatus, Page, Pageable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { ApiError } from "../errors";
import { MealFoodReq } from "../requests";
import { Food } from "./Food";
import { MealFood } from "./MealFood";
import { Recipe } from "./Recipe";
import { User } from "./User";

@Entity()
export class Meal extends BaseEntity {

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column({ length: 200 })
    public description: string;

    @Column({ type: "float" })
    public total_sugar: number;

    @Column()
    public timestamp: number;

    @ManyToMany((type) => Recipe)
    @JoinTable({
        name: "meal_recipes",
        joinColumn: {
            name: "meal_id",
        },
        inverseJoinColumn: {
            name: "recipe_id",
        },
    })
    public recipes: Recipe[];

    @OneToMany((type) => MealFood, (food) => food.meal, { cascade: true })
    public foods: MealFood[];

    // Repository functions

    public static async findAll(uid: string,
                                p: Pageable,
                                options: IMealQueryOptions = {}):
                                Promise<Page<Meal>> {
        const subq = (sqb: SelectQueryBuilder<Meal>) => {
            let subqb = sqb
                .select("meal.id")
                .leftJoin("meal.user", "user")
                .where("user.uid = :uid", { uid });

            if (Utils.optionDefault(options.hideDeleted, true)) {
                subqb = subqb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false");
            }

            return subqb;
        };

        let qb = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoinAndSelect("meal.foods", "meal_foods")
            .leftJoinAndSelect("meal_foods.food", "food")
            .where((sqb) => "meal.id IN " + p.limit(subq(sqb.subQuery().from("meal", "meal"))).getQuery());

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("recipes.deleted = false");
        }

        return p.queryWithCountQuery(qb, subq(this.createQueryBuilder("meal")));
    }

    public static findById(uid: string,
                           mealId: number,
                           options: IMealQueryOptions = {}):
                           Promise<Meal | undefined> {
        let qb = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("meal.id = :mealId", { mealId });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false")
                .andWhere("recipes.deleted = false");
        }

        return qb.getOne();
    }

    public async addRecipes(recipes_ids: number[]) {
        for (const recipeID of recipes_ids) {
            const r = await Recipe.findById(recipeID);
            if (r === undefined) {
                throw new ApiError(HttpStatus.NOT_FOUND, "recipe_not_found", `Recipe (${recipeID}) not found`);
            }
            this.recipes.push(r);
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
            mealFood.total_sugar = food.sugars_100g / 100 * mealFood.quantity;

            this.foods.push(mealFood);
        }
    }

    public computeTotalSugar() {
        this.total_sugar = 0;

        for (const recipe of this.recipes) {
            this.total_sugar += recipe.total_sugar;
        }
        for (const food of this.foods) {
            this.total_sugar += food.total_sugar;
        }
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IMealQueryOptions extends IBaseQueryOptions {
}
