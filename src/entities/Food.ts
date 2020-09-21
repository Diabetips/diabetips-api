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

    // Manually indexed with:
    // CREATE INDEX "IDX_0f9580637d3bcdd0c9d6558de0" ON "food" USING GIN ("name" gin_trgm_ops);
    // Note: gin_trgm_ops requires the "pg_trgm" extension
    @Column({ length: 300 })
    public name: string;

    @Column({ length: 10 })
    public unit: string;

    @Column({ type: "float", nullable: true })
    public energy_100g?: number;

    @Column({ type: "float", nullable: true })
    public carbohydrates_100g?: number;

    @Column({ type: "float", nullable: true })
    public sugars_100g?: number;

    @Column({ type: "float", nullable: true })
    public fat_100g?: number;

    @Column({ type: "float", nullable: true })
    public saturated_fat_100g?: number;

    @Column({ type: "float", nullable: true })
    public fiber_100g?: number;

    @Column({ type: "float", nullable: true })
    public proteins_100g?: number;

    @Column({ nullable: true })
    public nutriscore?: string;

    // Metadata about food data source
    // OpenFoodFacts: "openfoodfacts:" + code
    @Column({ name: "datasrc", length: 100, nullable: true, select: false })
    private _datasrc: string;

    // Build with:
    // OpenFoodFacts: unique_scans_n
    @Index()
    @Column({ name: "datarank", type: "bigint", default: 0, select: false })
    private _datarank: number;

    // Build with: UPDATE "food" SET "datarank" = to_tsvector('french', name);
    // Manually indexed with:
    // CREATE INDEX "IDX_1419635bc95b3829591127e448" ON "food" USING GIN ("datalex");
    @Column({ name: "datalex", type: "tsvector", nullable: true, select: false })
    private _datalex: number;

    @OneToOne(() => FoodPicture, (pic) => pic.food)
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
                .andWhere(new Brackets((bqb) => {
                    query.split(" ").forEach((keyword, index) => {
                        const param: { [key: string]: any } = {};
                        param[`keyword${index}`] = `%${keyword}%`;
                        bqb = bqb.orWhere(`food.name ILIKE :keyword${index}`, param);
                    });
                    return bqb;
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
