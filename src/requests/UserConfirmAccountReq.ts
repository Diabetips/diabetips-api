/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Feb 24 2020
*/

import { IsString, IsUUID } from "class-validator";

export class UserConfirmAccountReq {
    @IsString()
    @IsUUID()
    public code: string;
}
