/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { MealFoodReq } from ".";

export class MealUpdateReq {
    @IsOptional()
    @IsString()
    public description?: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    public recipes_ids?: number[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    public foods?: MealFoodReq[];

    @IsOptional()
    @IsInt()
    public timestamp?: number;
}
