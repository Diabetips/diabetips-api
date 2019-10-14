/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { Column, Entity } from "typeorm";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

@Entity()
@ApiModel({
    description: "Model for a Food object",
    name: "Food",
})
export class Food extends BaseEntity {

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

    @Column({ length: 200 })
    @ApiModelProperty({
        description: "Name of the food",
        example: "Apple",
    })
    public name: string;

    @Column({ length: 4 })
    @ApiModelProperty({
        description: "Measuring unit for the food",
        example: "g",
    })
    public unit: string;
}

interface IFoodQueryOptions extends IBaseQueryOptions {
}

interface IFoodSearchRequest extends IBaseSearchRequest {
    name?: string;
}
