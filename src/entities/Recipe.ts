/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Column, Entity, OneToMany} from "typeorm";

import { BaseEntity, getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

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

    public static async findAll(req: IRecipeSearchRequest = {}, options: IRecipeQueryOptions = {}):
                                Promise<[Recipe[], number]> {
        let subquery = this
            .createQueryBuilder("recipe")
            .select("recipe.id");

        if (optionDefault(options.hideDeleted, true)) {
            subquery = subquery.andWhere("recipe.deleted = 0");
        }
        if (req.name !== undefined) {
            subquery = subquery.andWhere(`recipe.name LIKE :name`, { name: "%" + req.name + "%" });
        }

        const query = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .andWhere("recipe.id IN (" + getPageableQuery(subquery, req).getQuery() + ")");

        return Promise.all([query.getMany(), subquery.getCount()]);
    }

    public static async findById(id: number, options: IRecipeQueryOptions = {}): Promise<Recipe | undefined> {
        let query = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .andWhere("recipe.id = :id", { id });

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("recipe.deleted = 0");
        }
        return query.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IRecipeQueryOptions extends IBaseQueryOptions {
}

export interface IRecipeSearchRequest extends IBaseSearchRequest {
    name?: string;
}
