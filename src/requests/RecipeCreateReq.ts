/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, ValidateNested, IsInt, IsPositive } from "class-validator";

import { IngredientCreateReq } from "./IngredientCreateReq";

export class RecipeCreateReq {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    public description: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested()
    @Type(() => IngredientCreateReq)
    public ingredients: IngredientCreateReq[];

    @IsInt()
    @IsPositive()
    public portions: number;
}
