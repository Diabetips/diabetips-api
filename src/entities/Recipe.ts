
/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Column, Entity, OneToMany} from "typeorm";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, manualPagination, optionDefault } from "./BaseEntity";

import { Ingredient } from ".";

@Entity()
export class Recipe extends BaseEntity {

    @Column({ length: 50 })
    public name: string;

    @Column({ length: 200 })
    public description: string;

    @OneToMany((type) => Ingredient, (ingredient) => ingredient.recipe, { cascade: true })
    public ingredients: Ingredient[];

    // Repository functions

    public static async findAll(req: IRecipeSearchRequest = {}, options: IRecipeQueryOptions = {}): Promise<Recipe[]> {
        let query = this
        .createQueryBuilder("recipe")
        .leftJoinAndSelect("recipe.ingredients", "ingredients")
        .leftJoinAndSelect("ingredients.food", "food");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("recipe.deleted = 0");
        }
        if (req.name !== undefined) {
            query = query.andWhere(`recipe.name LIKE :name`, { name: "%" + req.name + "%" });
        }

        return manualPagination(await query.getMany(), req);
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
