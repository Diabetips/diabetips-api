/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsEmail } from "class-validator";

export class UserConnectionInviteReq {
    @IsEmail()
    public email: string;
}
