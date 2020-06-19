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
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_auth", "Invalid authorization token");
        }
        return user;
    }

    public static async getAllUsers(p: Pageable): Promise<Page<User>> {
        // TODO
        // * access checks:
        //   if no current user: throw access denied error
        // * only return current user if not admin
        return User.findAll(p);
    }

    public static async registerUser(req: UserCreateReq): Promise<User> {
        // TODO
        // * access checks:
        //   if current user and current user not admin: throw access denied error

        let user = new User();

        user.uid = uuid.v4();
        user.email = req.email;
        user.password = req.password; // hashes password
        user.lang = req.lang;
        user.timezone = req.timezone;
        user.first_name = req.first_name;
        user.last_name = req.last_name;

        if (await User.countByEmail(user.email) > 0) {
            throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
        }

        user = await user.save();

        const confirm = await UserConfirmationService.createUserConfirmation(user);
        sendMail("account-registration", user.lang, user.email, {
            email: user.email,
            code: confirm.code,
        });

        return user;
    }

    public static async getUser(uid: string, options?: IUserQueryOptions): Promise<User> {
        // TODO
        // * access checks:
        //   if no current user: throw access denied error
        //   if current user uid != uid or current user not admin: throw not found
        const user = await User.findByUid(uid, options);
        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${uid} not found`);
        }
        return user;
    }

    public static async updateUser(uid: string, req: UserUpdateReq): Promise<User> {
        const user = await this.getUser(uid, { selectPassword: true });

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

        if (req.password != null && !await bcrypt.compare(req.password, user.password as string)) {
            user.password = req.password; // hashes password

            sendMail("account-password-changed", user.lang, user.email);
        }

        return user.save();
    }

    public static async deleteUser(uid: string): Promise<void> {
        const user = await this.getUser(uid); // getUser handles access checks
        user.deleted = true;
        await user.save();

        sendMail("account-deletion", user.lang, user.email);
    }

}
