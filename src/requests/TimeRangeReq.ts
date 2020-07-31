/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { Type } from "class-transformer";
import { IsDate } from "class-validator";

// technically should extend Timeable but because validation decorator are inherited, including the IsOptional ones, we can't :]
export class TimeRangeReq {
    @IsDate()
    @Type(() => Date)
    public start: Date;

    @IsDate()
    @Type(() => Date)
    public end: Date;
}
