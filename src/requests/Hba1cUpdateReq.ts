/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class Hba1cUpdateReq {
    @IsOptional()
    @IsInt()
    @IsPositive()
    public timestamp?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(30)
    public value?: number;
}
