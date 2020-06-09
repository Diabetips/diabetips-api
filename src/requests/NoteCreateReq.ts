/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsInt, IsPositive, IsString, Length } from "class-validator";

export class NoteCreateReq {
    @IsInt()
    @IsPositive()
    public timestamp: number;

    @IsString()
    @Length(0, 500)
    public description: string;
}