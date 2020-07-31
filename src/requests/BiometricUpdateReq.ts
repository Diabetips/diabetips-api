/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";

import { DiabetesType, SexEnum } from "../entities";

export class BiometricUpdateReq {
    @IsDate()
    @IsOptional()
    @Type(() => Date)
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

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public hypoglycemia?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    public hyperglycemia?: number;

}
