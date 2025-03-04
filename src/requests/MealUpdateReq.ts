/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { Type } from "class-transformer";
import { IsArray, IsDate, IsOptional, IsString, ValidateNested } from "class-validator";

import { MealFoodReq, MealRecipeReq } from ".";

export class MealUpdateReq {
    @IsOptional()
    @IsString()
    public description?: string;

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

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    public time?: Date;
}
