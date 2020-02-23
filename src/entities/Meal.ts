/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, SelectQueryBuilder } from "typeorm";

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

    @Column()
    public timestamp: number;

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
        const subq = (sqb: SelectQueryBuilder<Meal>) => {
            let subqb = sqb
                .select("meal.id")
                .leftJoin("meal.user", "user")
                .where("user.uid = :uid", { uid });

            if (Utils.optionDefault(options.hideDeleted, true)) {
                subqb = subqb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false");
            }

            return subqb;
        };

        let qb = this
            .createQueryBuilder("meal")
            .leftJoinAndSelect("meal.recipes", "recipes")
            .where((sqb) => "meal.id IN " + p.limit(subq(sqb.subQuery().from("meal", "meal"))).getQuery());

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("recipes.deleted = false");
        }

        return p.queryWithCountQuery(qb, subq(this.createQueryBuilder("meal")));
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
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("meal.deleted = false")
                .andWhere("recipes.deleted = false");
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
