/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Feb 26 2020
*/

import { Type } from "class-transformer";
import { IsEnum, IsDate, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

import { InsulinType } from "../entities";

export class InsulinUpdateReq {
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    public time?: Date;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public quantity?: number;

    @IsOptional()
    @IsString()
    public description?: string;

    @IsOptional()
    @IsEnum(InsulinType)
    public type?: InsulinType;
}
