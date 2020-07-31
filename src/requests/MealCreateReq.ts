/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { Type } from "class-transformer";
import { IsArray, IsISO8601, IsOptional, IsString, ValidateNested } from "class-validator";

import { MealFoodReq, MealRecipeReq } from ".";

export class MealCreateReq {
    @IsString()
    public description: string;

    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => MealRecipeReq)
    public recipes?: MealRecipeReq[];

    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => MealFoodReq)
    public foods?: MealFoodReq[];

    @IsString()
    @IsISO8601()
    public time: Date;
}
