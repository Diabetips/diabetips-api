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

    @ManyToOne(() => Food)
    @JoinColumn()
    public food: Food;

    @ManyToOne(() => Recipe)
    @JoinColumn()
    public recipe: Recipe;

    @ManyToOne(() => MealRecipe)
    @JoinColumn()
    public meal_recipe: MealRecipe;

    // Repository functions

    public async init(ingReq: IngredientCreateReq) {
        const f = await Food.findById(ingReq.food_id);
        if (f === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food (${ingReq.food_id}) not found`);
        }
        this.quantity = ingReq.quantity;
        this.food = f;
        this.computeNutritionDataTotals()
    }

    public computeNutritionDataTotals() {
        this.total_energy        = (this.food.energy_100g ?? 0) / 100 * this.quantity;
        this.total_carbohydrates = (this.food.carbohydrates_100g ?? 0) / 100 * this.quantity;
        this.total_sugars        = (this.food.sugars_100g ?? 0) / 100 * this.quantity;
        this.total_fat           = (this.food.fat_100g ?? 0) / 100 * this.quantity;
        this.total_saturated_fat = (this.food.saturated_fat_100g ?? 0) / 100 * this.quantity;
        this.total_fiber         = (this.food.fiber_100g ?? 0) / 100 * this.quantity;
        this.total_proteins      = (this.food.proteins_100g ?? 0) / 100 * this.quantity;
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
