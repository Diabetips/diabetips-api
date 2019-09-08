/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 07 2019
*/

import { Food } from "../entities";
import { IFoodSearchRequest } from "../entities/Food";
import { BaseService } from "./BaseService";

export class FoodService extends BaseService {
    public static async getAllFood(req: IFoodSearchRequest): Promise<Food[]> {
        // TODO: pagination
        return Food.findAll(req);
    }

    public static async getFood(id: number): Promise<Food | undefined> {
        if (Number.isNaN(id)) {
            // TODO: What to do in case of NaN ? Verify in controller or here ?
            console.log("woop woop");
        }
        return Food.findById(id);
    }

    // TODO: this is temporary
    public static async addFood(req: any): Promise<Food> {
        const food = new Food();

        food.name = req.name;
        food.unit = req.unit;
        return food.save();
    }
}
