/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsISO8601, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class Hba1cUpdateReq {
    @IsString()
    @IsISO8601()
    @IsOptional()
    public time?: Date;

    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    public value?: number;
}