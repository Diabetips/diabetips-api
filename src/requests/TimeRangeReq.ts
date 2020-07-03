/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { IsInt, IsPositive, Min } from "class-validator";
import { Timeable } from "../lib";

export class TimeRangeReq extends Timeable {
    @IsInt()
    @Min(0)
    public start: number;

    @IsInt()
    @IsPositive()
    public end: number;
}
