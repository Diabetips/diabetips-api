/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Apr 16 2020
*/

import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { IngredientCreateReq } from ".";

export class MealRecipeReq {
    @IsInt()
    @IsPositive()
    public id: number;

    @IsArray()
    @IsOptional()
    @ValidateNested()
    @Type(() => IngredientCreateReq)
    public modifications?: IngredientCreateReq[];
}
