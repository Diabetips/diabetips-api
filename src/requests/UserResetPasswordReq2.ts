/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Apr 17 2020
*/

import { IsString, IsUUID, Matches, MinLength } from "class-validator";

export class UserResetPasswordReq2 {
    @IsString()
    @IsUUID()
    public code: string;

    @IsString()
    @MinLength(8, { message: "password must contain at least 8 characters" })
    @Matches(/[0-9]/, { message: "password must contain at least 1 digit" })
    @Matches(/[A-Z]/, { message: "password must contain at least 1 uppercase letter" })
    @Matches(/[a-z]/, { message: "password must contain at least 1 lowercase letter" })
    public password: string;
}
