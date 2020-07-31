/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { ArrayNotEmpty, IsArray, IsInt, IsISO8601, IsPositive, IsString, Max, Min } from "class-validator";

export class BloodSugarCreateReq {
    @IsString()
    @IsISO8601()
    public start: Date;

    @IsInt()
    @IsPositive()
    public interval: number;

    @IsArray()
    @ArrayNotEmpty()
    @Min(0, { each: true })
    @Max(1000, { each: true })
    public measures: number[];
}
