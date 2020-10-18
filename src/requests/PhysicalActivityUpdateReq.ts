/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class PhysicalActivityUpdateReq {
    @IsOptional()
    @IsString()
    public title?: string;

    @IsOptional()
    @IsString()
    public description?: string;

    @IsOptional()
    @IsString()
    public type?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(120)
    public intensity?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public calories?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    public start?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    public end?: Date
}