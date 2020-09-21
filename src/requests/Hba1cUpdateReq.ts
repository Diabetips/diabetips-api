/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, Max, Min } from "class-validator";

export class Hba1cUpdateReq {
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    public time?: Date;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    public value?: number;
}