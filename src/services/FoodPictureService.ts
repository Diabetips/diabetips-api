/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Jan 18 2020
*/

import sharp = require("sharp");

import { BaseService } from "./BaseService";
import { FoodService } from "./FoodService";

const DEFAULT_FOOD_PICTURE = sharp("data/default_food_picture.svg").jpeg().toBuffer();

export class FoodPictureService extends BaseService {

    public static async getFoodPicture(id: number): Promise<Buffer> {
        const food = await FoodService.getFood(id);
        const pic = await food.picture;
        return pic?.blob || DEFAULT_FOOD_PICTURE;
    }

}
