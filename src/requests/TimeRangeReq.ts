/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { Type } from "class-transformer";
import { IsDate } from "class-validator";

import { Timeable } from "../lib";

export class TimeRangeReq extends Timeable {
    @IsDate()
    @Type(() => Date)
    public start: Date;

    @IsDate()
    @Type(() => Date)
    public end: Date;
}
