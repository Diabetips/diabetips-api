/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsISO8601, IsOptional, IsString, Length } from "class-validator";

export class EventUpdateReq {
    @IsString()
    @IsISO8601()
    @IsOptional()
    public start?: Date;

    @IsString()
    @IsISO8601()
    @IsOptional()
    public end?: Date;

    @IsString()
    @Length(0, 500)
    @IsOptional()
    public description?: string;
}