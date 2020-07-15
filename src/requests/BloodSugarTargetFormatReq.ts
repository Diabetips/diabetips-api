/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jul 15 2020
*/

import { IsEnum, IsOptional } from "class-validator";
import { BloodSugarTargetFormat } from "../entities";

export class BloodSugarTargetFormatReq {
    @IsOptional()
    @IsEnum(BloodSugarTargetFormat)
    public format: string = BloodSugarTargetFormat.PERCENTAGE;
}