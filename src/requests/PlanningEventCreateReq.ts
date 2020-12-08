/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Nov 14 2020
*/

import { Type } from "class-transformer";
import { IsArray, IsDate, IsOptional, IsString, IsUUID } from "class-validator";

export class PlanningEventCreateReq {
    @IsString()
    public title: string;

    @IsString()
    public description: string;

    @IsDate()
    @Type(() => Date)
    public start: Date;

    @IsDate()
    @Type(() => Date)
    public end: Date;

    @IsOptional()
    @IsArray()
    @IsUUID("all", {each: true})
    public members?: string[];
}