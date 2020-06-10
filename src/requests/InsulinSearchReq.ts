/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jun 10 2020
*/

import { IsOptional, IsEnum } from "class-validator";
import { InsulinType } from "../entities";

export class InsulinSearchReq {
    @IsOptional()
    @IsEnum(InsulinType)
    public type?: string;
}