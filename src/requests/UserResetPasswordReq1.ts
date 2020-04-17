/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 11 2020
*/

import { IsEmail, IsString } from "class-validator";

export class UserResetPasswordReq1 {
    @IsString()
    @IsEmail(undefined, { message: "email must be a valid email address" })
    public email: string;
}
