/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsInt, IsPositive, IsString, Length, IsOptional } from "class-validator";

export class NoteUpdateReq {
    @IsInt()
    @IsPositive()
    @IsOptional()
    public timestamp?: number;

    @IsString()
    @Length(0, 500)
    @IsOptional()
    public description?: string;
}