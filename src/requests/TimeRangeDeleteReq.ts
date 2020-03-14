/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { IsInt, IsOptional, IsPositive } from "class-validator";

export class TimeRangeDeleteReq {
    @IsInt()
    @IsPositive()
    public start: number;

    @IsInt()
    @IsPositive()
    public end: number;
}
