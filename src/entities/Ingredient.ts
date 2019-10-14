/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Oct 10 2019
*/

import { Column, Entity, ManyToOne } from "typeorm";
import { Food, Recipe } from ".";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

export interface IIngredientRequest {
    foodID: number;
    quantity: number;
}

@Entity()
export class Ingredient extends BaseEntity {

    public static async findAll(req: IIngredientSearchRequest = {},
                                options: IIngredientQueryOptions = {}): Promise<Ingredient[]> {
        let query = this
            .createQueryBuilder("ingredient")
            .select("ingredient");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("ingredient.deleted = 0");
        }
        // TODO: pagination

        return query.getMany();
    }

    public static async findById(id: number, options: IIngredientQueryOptions = {}): Promise<Ingredient | undefined> {
        let query = this
            .createQueryBuilder("ingredient")
            .select("ingredient")
            .andWhere("ingredient.id = :id", { id });

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("ingredient.deleted = 0");
        }

        return query.getOne();

    }


    @Column({})
    public quantity: number;

    @ManyToOne((type) => Recipe)
    public recipe: Recipe;

    @ManyToOne((type) => Food)
    public food: Food;
}

// tslint:disable-next-line: no-empty-interface
interface IIngredientQueryOptions extends IBaseQueryOptions {

}

// tslint:disable-next-line: no-empty-interface
export interface IIngredientSearchRequest extends IBaseSearchRequest {
}
