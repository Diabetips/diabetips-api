/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, IsPositive, IsInt } from "class-validator";

import { IngredientCreateReq } from "./IngredientCreateReq";

export class RecipeUpdateReq {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public description?: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested()
    @Type(() => IngredientCreateReq)
    public ingredients?: IngredientCreateReq[];

    @IsOptional()
    @IsInt()
    @IsPositive()
    public portions?: number;
}
