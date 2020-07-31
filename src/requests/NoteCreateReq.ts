/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Type } from "class-transformer";
import { IsDate, IsString, Length } from "class-validator";

export class NoteCreateReq {
    @IsDate()
    @Type(() => Date)
    public time: Date;

    @IsString()
    @Length(0, 500)
    public description: string;
}