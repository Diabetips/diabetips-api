/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Oct 10 2019
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { HttpStatus, Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

import { Food, MealRecipe, Recipe } from ".";
import { ApiError } from "../errors";
import { IngredientCreateReq } from "../requests";

@Entity()
export class Ingredient extends BaseEntityHiddenId {

    @Column({ type: "float" })
    public quantity: number;

    @Column({ type: "float" })
    public total_sugar: number;

    @ManyToOne((type) => Food)
    @JoinColumn({ name: "food_id" })
    public food: Food;

    @ManyToOne((type) => Recipe)
    @JoinColumn({ name: "recipe_id" })
    public recipe: Recipe;

    @ManyToOne((type) => MealRecipe)
    @JoinColumn({ name: "meal_recipe_id" })
    public meal_recipe: MealRecipe;

    // Repository functions

    public async init(ingReq: IngredientCreateReq) {
        const f = await Food.findById(ingReq.food_id);
        if (f === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.food_id}) not found`);
        }
        this.quantity = ingReq.quantity;
        this.food = f;
        this.computeTotalSugar()
    }

    public computeTotalSugar() {
        this.total_sugar = this.quantity * this.food.sugars_100g / 100;
    }

    public static async findAll(options: IBaseQueryOptions = {}): Promise<Ingredient[]> {
        let qb = this.createQueryBuilder("ingredient");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("ingredient.deleted = false");
        }

        return qb.getMany();
    }

    public static async findById(id: number, options: IBaseQueryOptions = {}): Promise<Ingredient | undefined> {
        let qb = this
            .createQueryBuilder("ingredient")
            .where("ingredient.id = :id", { id });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("ingredient.deleted = false");
        }

        return qb.getOne();
    }

}
