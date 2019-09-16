/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Column, Entity } from "typeorm";

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

@Entity()
@ApiModel({
    description: "Model for a user's meal",
    name: "UserMeal",
})
export class UserMeal extends BaseEntity {

    public static async findAll(patientUid: string, req: IUserMealSearchRequest = {},
        options: IUserMealQueryOptions = {}): Promise<UserMeal[]> {
        // TODO: Needs to be finished, idk how meals/patients will be linked
        let query = this.
            createQueryBuilder("meal")
            .select("meal");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getMany();
    }

    public static async findById(patientUid: string, mealId: number,
        options: IUserMealQueryOptions = {}): Promise<UserMeal | undefined> {
        // TODO: Needs to be finished, idk how meals/patients will be linked
        let query = this.
            createQueryBuilder("meal")
            .select("meal");

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getOne();
    }

    @Column({ length: 200 })
    @ApiModelProperty({
        description: "Description of the meal set by the user.",
        example: "Lunch on the 7th of March",
    })
    public description: string;

    // TODO: add recipes

}

interface IUserMealQueryOptions extends IBaseQueryOptions {

}

// TODO? Will it be used ?
export interface IUserMealSearchRequest extends IBaseSearchRequest {

}
