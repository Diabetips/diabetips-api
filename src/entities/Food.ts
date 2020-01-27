/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest } from "./BaseEntity";

import { FoodPicture } from "./FoodPicture";
export { FoodPicture };

@Entity()
export class Food extends BaseEntity {

    @Column({ length: 200 })
    public name: string;

    @Column({ length: 10 })
    public unit: string;

    @Column({ type: "float" })
    public sugars_100g: number;

    @OneToOne((type) => FoodPicture, (pic) => pic.food)
    public picture: Promise<FoodPicture>;

    // Repository functions

    public static async findAll(p: Pageable,
                                req: IFoodSearchRequest = {},
                                options: IFoodQueryOptions = {}):
                                Promise<Page<Food>> {
        let qb = this.createQueryBuilder("food");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("food.deleted = 0");
        }
        if (req.name !== undefined) {
            qb = qb.andWhere(`food.name LIKE :name`, { name: "%" + req.name + "%" });
        }

        return p.query(qb);
    }

    public static async findById(id: number, options: IFoodQueryOptions = {}): Promise<Food | undefined> {
        let qb = this
            .createQueryBuilder("food")
            .where("food.id = :id", { id });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("food.deleted = 0");
        }

        return qb.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IFoodQueryOptions extends IBaseQueryOptions {
}

export interface IFoodSearchRequest extends IBaseSearchRequest {
    name?: string;
}
