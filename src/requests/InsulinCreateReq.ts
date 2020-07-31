/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Feb 26 2020
*/

import { Type } from "class-transformer";
import { IsEnum, IsDate, IsNumber, IsPositive, IsString } from "class-validator";

import { InsulinType } from "../entities";

export class InsulinCreateReq {
    @IsDate()
    @Type(() => Date)
    public time: Date;

    @IsNumber()
    @IsPositive()
    public quantity: number;

    @IsString()
    public description: string;

    @IsEnum(InsulinType)
    public type: InsulinType;
}
