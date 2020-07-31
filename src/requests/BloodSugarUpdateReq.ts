/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsDate, IsPositive, Max, Min } from "class-validator";

export class BloodSugarUpdateReq {
    @IsDate()
    @Type(() => Date)
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
