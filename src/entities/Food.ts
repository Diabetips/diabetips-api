/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Brackets, Column, Entity, Index, OneToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";
import { FoodSearchReq } from "../requests";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { FoodPicture } from "./FoodPicture";
export { FoodPicture };

@Entity()
export class Food extends BaseEntity {

    // Indexed on prod server using GIN and gin_trgm_ops, but index types are not supported by TypeORM.
    @Column({ length: 200 })
    public name: string;

    @Column({ length: 10 })
    public unit: string;

    @Column({ type: "float" })
    public sugars_100g: number;

    // Information about food data source
    // For OpenFoodFacts: "openfoodfacts:" + code
    @Column({ name: "datasrc", length: 100, nullable: true, select: false })
    private _datasrc: string;

    // For OpenFoodFacts data: unique_scans_n
    @Index()
    @Column({ name: "datarank", type: "bigint", default: 0, select: false })
    private _datarank: number;

    // Indexed on prod server using GIN, but index types are not supported by TypeORM.
    // Value = to_tsvector('french', name), not a default because can't reference another column in expr.
    @Column({ name: "datalex", type: "tsvector", nullable: true, select: false })
    private _datalex: number;

    @OneToOne((type) => FoodPicture, (pic) => pic.food)
    public picture: Promise<FoodPicture>;

    // Repository functions

    public static async findAll(p: Pageable,
                                req: FoodSearchReq = {},
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Food>> {
        let qb = this
            .createQueryBuilder("food")

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("food.deleted = false");
        }
        if (req.name !== undefined && req.name !== "") {
            const query = req.name;
            qb = qb
                .andWhere(new Brackets((qb) => {
                    query.split(" ").forEach((keyword) => {
                        qb = qb.orWhere("food.name ILIKE :keyword", { keyword: `%${keyword}%`});
                    });
                }))
                .orderBy("ts_rank_cd(food.datalex, phraseto_tsquery('french', :name), 2) * sqrt(food.datarank)", "DESC")
                .setParameter("name", req.name);
        } else {
            qb.orderBy("food.datarank", "DESC");
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
