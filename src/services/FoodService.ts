/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 07 2019
*/

import { Food } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";

// TODO: remove that too
export interface ICreateFoodRequest {
    name: string;
    unit: string;
    sugar: number;
}

export class FoodService extends BaseService {

    public static async getAllFood(query: any): Promise<[Promise<Food[]>, Promise<number>]> {
        return Food.findAll(query);
    }

    public static async getFood(id: number): Promise<Food> {
        const food = await Food.findById(id);
        if (food === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food ${id} not found`);
        }
        return food;
    }

    // TODO: this is temporary
    public static async addFood(req: ICreateFoodRequest): Promise<Food> {
        const food = new Food();

        food.name = req.name;
        food.unit = req.unit;
        food.sugar = req.sugar;
        return food.save();
    }
}
