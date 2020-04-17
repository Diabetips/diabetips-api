/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Apr 17 2020
*/

import uuid = require("uuid");

import { User, UserPasswordReset } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { sendMail } from "../mail";
import { UserResetPasswordReq1, UserResetPasswordReq2 } from "../requests";

import { BaseService } from "./BaseService";

export class UserResetPasswordService extends BaseService {

    public static async resetPassword1(req: UserResetPasswordReq1) {
        const user = await User.findByEmail(req.email);
        if (user === undefined) {
            return;
        }

        const rst = new UserPasswordReset();
        rst.user = Promise.resolve(user);
        rst.code = uuid.v4();
        await rst.save();

        sendMail("account-password-reset", user.lang, user.email, {
            code: rst.code,
        });
    }

    public static async resetPassword2(req: UserResetPasswordReq2) {
        const rst = await UserPasswordReset.findByCode(req.code);
        if (rst === undefined) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_code", "Invalid password reset code");
        }

        const user = await rst.user;
        if (user === undefined) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_code", "Invalid password reset code");
        }

        user.password = req.password;
        rst.code = null;
        rst.used = true;
        return Promise.all([user.save(), rst.save()]);
    }

}
