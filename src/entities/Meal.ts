/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";

import { BaseEntity, getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

import { Recipe } from "./Recipe";
import { User } from "./User";

@Entity()
export class Meal extends BaseEntity {

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column({ length: 200 })
    public description: string;

    @Column({ type: "float" })
    public total_sugar: number;

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

    public static async findAll(uid: string, req: IMealSearchRequest = {}, options: IMealQueryOptions = {}):
                                Promise<[Meal[], number]> {
        let subquery = this
            .createQueryBuilder("meal")
            .select("meal.id")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :uid", { uid });
        if (optionDefault(options.hideDeleted, true)) {
            subquery = subquery.andWhere("user.deleted = 0")
                               .andWhere("meal.deleted = 0");
        }

        let query = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .andWhere("meal.id IN (" + getPageableQuery(subquery, req).getQuery() + ")");
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("recipes.deleted = 0");
        }
        return Promise.all([query.getMany(), subquery.getCount()]);
    }

    public static async findById(uid: string, mealId: number,
                                 options: IMealQueryOptions = {}): Promise<Meal | undefined> {
        let query = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .andWhere("user.uid = :uid", { uid })
            .andWhere("meal.id = :mealId", { mealId });
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
