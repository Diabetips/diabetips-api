/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Dec 07 2020
*/

import { IsBoolean, IsOptional } from "class-validator";

export class UserAppsSearchReq {
    @IsOptional()
    @IsBoolean()
    public internal?: boolean;
}
