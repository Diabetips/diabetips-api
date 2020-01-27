/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 07 2019
*/

import { Food, IFoodSearchRequest } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";

import { BaseService } from "./BaseService";

export class FoodService extends BaseService {

    public static async getAllFood(p: Pageable, req: IFoodSearchRequest): Promise<Page<Food>> {
        return Food.findAll(p, req);
    }

    public static async getFood(id: number): Promise<Food> {
        const food = await Food.findById(id);
        if (food === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "food_not_found", `Food ${id} not found`);
        }
        return food;
    }
}
