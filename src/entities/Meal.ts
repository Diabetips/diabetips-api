/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest } from "./BaseEntity";

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

    public static async findAll(uid: string,
                                p: Pageable,
                                req: IMealSearchRequest = {},
                                options: IMealQueryOptions = {}):
                                Promise<Page<Meal>> {
        let subqb = this
            .createQueryBuilder("meal")
            .select("meal.id")
            .leftJoin("meal.user", "user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            subqb = subqb.andWhere("user.deleted = 0")
                               .andWhere("meal.deleted = 0");
        }

        let qb = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .where("meal.id IN (" + p.limit(subqb).getQuery() + ")");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("recipes.deleted = 0");
        }

        return p.queryWithCountQuery(qb, subqb);
    }

    public static findById(uid: string,
                           mealId: number,
                           options: IMealQueryOptions = {}):
                           Promise<Meal | undefined> {
        let qb = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .leftJoin("meal.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("meal.id = :mealId", { mealId });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0")
                         .andWhere("meal.deleted = 0")
                         .andWhere("recipes.deleted = 0");
        }

        return qb.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IMealQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IMealSearchRequest extends IBaseSearchRequest {
}
