/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 11 2020
*/

import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

import { getLangs } from "../i18n";

export class UserUpdateReq {
    @IsOptional()
    @IsString()
    @IsEmail(undefined, { message: "email must be a valid email address" })
    public email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8, { message: "password must contain at least 8 characters" })
    @Matches(/[0-9]/, { message: "password must contain at least 1 digit" })
    @Matches(/[A-Z]/, { message: "password must contain at least 1 uppercase letter" })
    @Matches(/[a-z]/, { message: "password must contain at least 1 lowercase letter" })
    public password?: string;

    @IsOptional()
    @IsString()
    @IsIn(getLangs())
    public lang?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public first_name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    public last_name?: string;
}
