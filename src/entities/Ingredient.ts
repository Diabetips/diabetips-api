/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Oct 10 2019
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

import { Food } from "./Food";
import { Recipe } from "./Recipe";

@Entity()
export class Ingredient extends BaseEntityHiddenId {

    @Column({ type: "float" })
    public quantity: number;

    @Column({ type: "float" })
    public total_sugar: number;

    @ManyToOne((type) => Recipe)
    @JoinColumn({ name: "recipe_id" })
    public recipe: Recipe;

    @ManyToOne((type) => Food)
    @JoinColumn({ name: "food_id" })
    public food: Food;

    // Repository functions

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
