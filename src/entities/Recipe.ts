/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Column, Entity, OneToMany} from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest } from "./BaseEntity";

import { Ingredient } from "./Ingredient";

@Entity()
export class Recipe extends BaseEntity {

    @Column({ length: 50 })
    public name: string;

    @Column({ length: 200 })
    public description: string;

    @Column({ type: "float" })
    public total_sugar: number;

    @OneToMany((type) => Ingredient, (ingredient) => ingredient.recipe, { cascade: true })
    public ingredients: Ingredient[];

    // Repository functions

    public static async findAll(p: Pageable,
                                req: IRecipeSearchRequest = {},
                                options: IRecipeQueryOptions = {}):
                                Promise<Page<Recipe>> {
        let subqb = this
            .createQueryBuilder("recipe")
            .select("recipe.id");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            subqb = subqb.andWhere("recipe.deleted = 0");
        }
        if (req.name !== undefined) {
            subqb = subqb.andWhere(`recipe.name LIKE :name`, { name: "%" + req.name + "%" });
        }

        const qb = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .where("recipe.id IN (" + p.limit(subqb).getQuery() + ")");

        return p.queryWithCountQuery(qb, subqb);
    }

    public static async findById(id: number, options: IRecipeQueryOptions = {}): Promise<Recipe | undefined> {
        let qb = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .where("recipe.id = :id", { id });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("recipe.deleted = 0");
        }

        return qb.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IRecipeQueryOptions extends IBaseQueryOptions {
}

export interface IRecipeSearchRequest extends IBaseSearchRequest {
    name?: string;
}
