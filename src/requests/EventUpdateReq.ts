/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString, Length } from "class-validator";

export class EventUpdateReq {
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    public start?: Date;
    
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    public end?: Date;

    @IsString()
    @Length(0, 500)
    @IsOptional()
    public description?: string;
}