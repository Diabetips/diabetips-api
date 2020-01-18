/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, manualPagination, optionDefault } from "./BaseEntity";

import { Recipe, User } from ".";

@Entity()
export class Meal extends BaseEntity {

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    public user: Promise<User>;

    @Column({ length: 200 })
    public description: string;

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

    // Repository functions

    public static async findAll(uid: string, req: IMealSearchRequest = {},
                                options: IMealQueryOptions = {}): Promise<[Meal[], Promise<number>]> {
        let query = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :uid", { uid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                            .andWhere("meal.deleted = 0")
                            .andWhere("recipes.deleted = 0");
        }

        return [manualPagination(await query.getMany(), req), query.getCount()];
    }

    public static async findById(uid: string, mealId: number,
                                 options: IMealQueryOptions = {}): Promise<Meal | undefined> {
        let query = this
            .createQueryBuilder("meal")
            .andWhere("meal.id = :mealId", { mealId })
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :uid", { uid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                            .andWhere("meal.deleted = 0")
                            .andWhere("recipes.deleted = 0");
        }
        return query.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IMealQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IMealSearchRequest extends IBaseSearchRequest {
}
