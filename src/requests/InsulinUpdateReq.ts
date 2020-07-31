/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Feb 26 2020
*/

import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

import { InsulinType } from "../entities";

export class InsulinUpdateReq {
    @IsOptional()
    @IsString()
    @IsISO8601()
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
