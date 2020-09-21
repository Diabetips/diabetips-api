/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 19 2020
*/

import { IsHexColor, IsString, Length } from "class-validator";

export class StickyNoteCreateReq {
    @IsString()
    public title: string;

    @IsString()
    public content: string;

    @IsHexColor()
    @Length(7)
    public color: string;
}