/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { Recipe, User } from ".";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

@Entity()
@ApiModel({
    description: "Model for a user's meal",
    name: "UserMeal",
})
export class UserMeal extends BaseEntity {

    public static async findAll(patientUid: string, req: IUserMealSearchRequest = {},
                                options: IUserMealQueryOptions = {}): Promise<UserMeal[]> {
        let query = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                            .andWhere("meal.deleted = 0")
                            .andWhere("recipes.deleted = 0");
        }
        return query.getMany();
    }

    public static async findById(patientUid: string, mealId: number,
                                 options: IUserMealQueryOptions = {}): Promise<UserMeal | undefined> {
        let query = this
            .createQueryBuilder("meal")
            .andWhere("meal.id = :mealId", { mealId })
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                            .andWhere("meal.deleted = 0")
                            .andWhere("recipes.deleted = 0");
        }
        return query.getOne();
    }

    // Necessary duplication of ID for documentation purposes
    @ApiModelProperty({
        description: "ID of the recipe",
        example: 7,
    })
    public id: number;

    @Column({ length: 200 })
    @ApiModelProperty({
        description: "Description of the meal set by the user.",
        example: "Lunch on the 7th of March",
    })
    public description: string;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    public user: User;

    @ApiModelProperty({
        description: "Recipes of the meal",
        model: "Recipe",
    })
    @ManyToMany((type) => Recipe)
    @JoinTable()
    public recipes: Recipe[];

}

// tslint:disable-next-line: no-empty-interface
interface IUserMealQueryOptions extends IBaseQueryOptions {

}

// tslint:disable-next-line: no-empty-interface
export interface IUserMealSearchRequest extends IBaseSearchRequest {

}
