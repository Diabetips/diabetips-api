/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { IsISO8601, IsString, Min } from "class-validator";

import { Timeable } from "../lib";

export class TimeRangeReq extends Timeable {
    @IsString()
    @IsISO8601()
    public start: Date;

    @IsString()
    @IsISO8601()
    public end: Date;
}
