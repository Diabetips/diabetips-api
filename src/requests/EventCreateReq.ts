/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsInt, IsPositive, IsOptional, IsString, Length } from "class-validator";

export class EventCreateReq {
    @IsInt()
    @IsPositive()
    public start: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    public end?: number;

    @IsString()
    @Length(0, 500)
    public description: string;
}