/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsISO8601, IsString, IsOptional, Length } from "class-validator";

export class NoteUpdateReq {
    @IsString()
    @IsISO8601()
    @IsOptional()
    public time?: Date;

    @IsString()
    @Length(0, 500)
    @IsOptional()
    public description?: string;
}