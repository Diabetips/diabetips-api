/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { IsEnum, IsISO8601, IsNumber, IsOptional, IsPositive } from "class-validator";
import { SexEnum, DiabetesType } from "../entities";

export class BiometricUpdateReq {
    @IsISO8601()
    @IsOptional()
    public date_of_birth?: Date;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public mass?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public height?: number;

    @IsOptional()
    @IsEnum(SexEnum)
    public sex?: SexEnum;

    @IsOptional()
    @IsEnum(DiabetesType)
    public diabetes_type?: DiabetesType;
}
