/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity } from "typeorm";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

@Entity()
export class Food extends BaseEntity {

    @Column({ length: 200 })
    public name: string;

    @Column({ length: 10 })
    public unit: string;

    // Repository functions

    public static async findAll(req: IFoodSearchRequest = {}, options: IFoodQueryOptions = {}): Promise<Food[]> {
        let query = this
            .createQueryBuilder("food")
            .select("food");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("food.deleted = 0");
        }

        if (req.name !== undefined) {
            query = query.andWhere(`food.name LIKE :name`, { name: "%" + req.name + "%" });
        }
        // TODO: pagination
        return query.getMany();
    }

    public static async findById(id: number, options: IFoodQueryOptions = {}): Promise<Food | undefined> {
        let query = this
            .createQueryBuilder("food")
            .select("food")
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
