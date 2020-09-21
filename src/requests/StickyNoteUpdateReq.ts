/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 19 2020
*/

import { IsHexColor, IsInt, IsOptional, IsString, Length } from "class-validator";

export class StickyNoteUpdateReq {
    @IsOptional()
    @IsString()
    public title: string;

    @IsOptional()
    @IsString()
    public content: string;

    @IsOptional()
    @IsHexColor()
    @Length(7)
    public color: string;

    @IsOptional()
    @IsInt()
    public index: number;
}