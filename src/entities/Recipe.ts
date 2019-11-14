
/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";
import { Ingredient } from "./Ingredient";

@Entity()
@ApiModel({
    description: "Model for a Recipe object",
    name: "Recipe",
})
export class Recipe extends BaseEntity {

    public static async findAll(req: IRecipeSearchRequest = {}, options: IRecipeQueryOptions = {}): Promise<Recipe[]> {
        let query = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("recipe.deleted = 0");
        }
        if (req.name !== undefined) {
            query = query.andWhere(`recipe.name LIKE :name`, { name: "%" + req.name + "%" });
        }
        return query.getMany();
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

    // Necessaryrop duplication of ID for documentation purposes
    @ApiModelProperty({
        description: "ID of the recipe",
        example: 7,
    })
    public id: number;

    @Column({ length: 50 })
    @ApiModelProperty({
        description: "Name of the recipe",
        example: "Lasagna",
    })
    public name: string;

    @Column({ length: 200 })
    @ApiModelProperty({
        description: "Description of the recipe",
        example: "Lasagnas are a delicious and cheap italian dish.",
    })
    public description: string;

    @ApiModelProperty({
        description: "Ingredients of the recipe",
        model: "Ingredient",
    })
    @OneToMany((type) => Ingredient, (ingredient) => ingredient.recipe, { cascade: true })
    public ingredients: Ingredient[];
}

// tslint:disable-next-line: no-empty-interface
interface IRecipeQueryOptions extends IBaseQueryOptions {

}

export interface IRecipeSearchRequest extends IBaseSearchRequest {
    name?: string;
}
