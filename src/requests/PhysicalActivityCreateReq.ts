/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsInt, IsNumber, IsPositive, IsString, Max, Min } from "class-validator";

export class PhysicalActivityCreateReq {
    @IsString()
    public title: string;

    @IsString()
    public description: string;

    @IsString()
    public type: string;

    @IsInt()
    @Min(0)
    @Max(120)
    public intensity: number;

    @IsNumber()
    @IsPositive()
    public calories: number;

    @IsDate()
    @Type(() => Date)
    public start: Date;

    @IsDate()
    @Type(() => Date)
    public end: Date
}