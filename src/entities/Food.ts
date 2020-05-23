/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";
import { FoodSearchReq } from "../requests";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

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

    @Column({ name: "datasrc", length: 100, nullable: true })
    private _datasrc: string;

    @OneToOne((type) => FoodPicture, (pic) => pic.food)
    public picture: Promise<FoodPicture>;

    // Repository functions

    public static async findAll(p: Pageable,
                                req: FoodSearchReq = {},
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Food>> {
        let qb = this.createQueryBuilder("food");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("food.deleted = false");
        }
        if (req.name !== undefined) {
            qb = qb.andWhere(`lower(food.name) LIKE lower(:name)`, { name: "%" + req.name + "%" });
        }

        return p.query(qb);
    }

    public static async findById(id: number, options: IBaseQueryOptions = {}): Promise<Food | undefined> {
        let qb = this
            .createQueryBuilder("food")
            .where("food.id = :id", { id });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("food.deleted = false");
        }

        return qb.getOne();
    }

}
