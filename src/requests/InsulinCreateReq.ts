/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Feb 26 2020
*/

import { IsEnum, IsInt, IsNumber, IsPositive, IsString } from "class-validator";

import { InsulinType } from "../entities";

export class InsulinCreateReq {
    @IsInt()
    @IsPositive()
    public timestamp: number;

    @IsNumber()
    @IsPositive()
    public quantity: number;

    @IsString()
    public description: string;

    @IsEnum(InsulinType)
    public type: InsulinType;
}
