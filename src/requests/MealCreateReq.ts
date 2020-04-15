/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { ArrayNotEmpty, IsArray, IsInt, IsPositive, IsString } from "class-validator";
import { MealFoodReq } from ".";

export class MealCreateReq {
    @IsString()
    public description: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    public recipes_ids: number[];

    @IsArray()
    @ArrayNotEmpty()
    public foods: MealFoodReq[];

    @IsInt()
    @IsPositive()
    public timestamp: number;
}
