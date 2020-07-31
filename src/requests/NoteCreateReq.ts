/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { IsISO8601, IsString, Length } from "class-validator";

export class NoteCreateReq {
    @IsString()
    @IsISO8601()
    public time: Date;

    @IsString()
    @Length(0, 500)
    public description: string;
}