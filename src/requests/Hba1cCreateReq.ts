/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsInt, IsNumber, IsPositive, Max, Min } from "class-validator";

export class Hba1cCreateReq {
    @IsInt()
    @IsPositive()
    public timestamp: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    public value: number;
}
