/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 02 2019
*/

import bcrypt = require("bcrypt");
import uuid = require("uuid");

import { IUserQueryOptions, User } from "../entities";
import { ApiError } from "../errors";
import { Context, HttpStatus, Page, Pageable } from "../lib";
import { sendMail } from "../mail";
import { UserCreateReq, UserUpdateReq } from "../requests";

import { BaseService } from "./BaseService";
import { UserConfirmationService } from "./UserConfirmationService";

export class UserService extends BaseService {

    /**
     * @warning throws ApiErrors if no user is logged in
     */
    public static async getCurrentUser(ctx: Context): Promise<User> {
        if (ctx.auth == null) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token");
        }
        if (ctx.auth.type !== "user") {
            throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
        }
        const user = await User.findByUid(ctx.auth.uid);
        if (user == null) {
            throw new Error("User not found");
        }
        return user;
    }

    public static async getAllUsers(p: Pageable): Promise<Page<User>> {
        return User.findAll(p);
    }

    public static async registerUser(req: UserCreateReq): Promise<User> {
        let user = new User();

        user.uid = uuid.v4();
        user.email = req.email;
        user.password = await bcrypt.hash(req.password, 12);
        user.lang = req.lang;
        user.timezone = req.timezone;
        user.first_name = req.first_name;
        user.last_name = req.last_name;

        if (await User.countByEmail(user.email) > 0) {
            throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
        }

        user = await user.save();
        user.password = undefined;

        const confirm = await UserConfirmationService.createUserConfirmation(user);
        sendMail("account-registration", user.lang, user.email, {
            email: user.email,
            code: confirm.code,
        });

        return user;
    }

    public static async getUser(uid: string, options?: IUserQueryOptions): Promise<User> {
        const user = await User.findByUid(uid, options);
        if (user == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${uid} not found`);
        }
        return user;
    }

    public static async updateUser(uid: string, req: UserUpdateReq): Promise<User> {
        const user = await this.getUser(uid, { selectPassword: req.password != null });

        if (req.lang != null) { user.lang = req.lang; }
        if (req.first_name != null) { user.first_name = req.first_name; }
        if (req.last_name != null) { user.last_name = req.last_name; }
        if (req.lang != null) { user.lang = req.lang; }
        if (req.timezone != null) { user.timezone = req.timezone; }

        if (req.email != null && req.email !== user.email) {
            if (await User.countByEmail(req.email) > 0) {
                throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
            }

            sendMail("account-email-changed", user.lang, [user.email, req.email], {
                old_email: user.email,
                new_email: req.email,
            });

            user.email = req.email;
        }

        if (req.password != null && !await bcrypt.compare(req.password, user.password!)) {
            user.password = await bcrypt.hash(req.password, 12);

            sendMail("account-password-changed", user.lang, user.email);
        }

        await user.save();
        user.password = undefined;

        return user;
    }

    public static async deleteUser(uid: string): Promise<void> {
        const user = await this.getUser(uid);
        user.deleted = true;
        await user.save();

        sendMail("account-deletion", user.lang, user.email);
    }

}
