/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { BaseEntity, getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

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

    public static async findAll(req: IFoodSearchRequest = {}, options: IFoodQueryOptions = {}):
                                Promise<[Food[], number]> {
        let query = this
            .createQueryBuilder("food");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("food.deleted = 0");
        }

        if (req.name !== undefined) {
            query = query.andWhere(`food.name LIKE :name`, { name: "%" + req.name + "%" });
        }

        query = getPageableQuery(query, req);

        return Promise.all([query.getMany(), query.getCount()]);
    }

    public static async findById(id: number, options: IFoodQueryOptions = {}): Promise<Food | undefined> {
        let query = this
            .createQueryBuilder("food")
            .where("food.id = :id", { id });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("food.deleted = 0");
        }
        return query.getOne();
    }
}

// tslint:disable-next-line: no-empty-interface
export interface IFoodQueryOptions extends IBaseQueryOptions {
}

export interface IFoodSearchRequest extends IBaseSearchRequest {
    name?: string;
}
