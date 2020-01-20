/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 02 2019
*/

import bcrypt = require("bcrypt");
import uuid = require("uuid");

import { IUserQueryOptions, User } from "../entities";
import { ApiError } from "../errors";
import { Context, HttpStatus } from "../lib";
import { sendMail } from "../mail";

import { BaseService } from "./BaseService";
import { UserConfirmationService } from "./UserConfirmationService";

export interface CreateUserReq {
    email: string;
    password: string;
    lang: string;
    first_name: string;
    last_name: string;
}

export interface UpdateUserReq {
    email?: string;
    password?: string;
    lang?: string;
    first_name?: string;
    last_name?: string;
}

export interface ResetPasswordReq {
    email: string;
}

export class UserService extends BaseService {

    /**
     * @warning throws ApiErrors if no user is logged in
     */
    public static getCurrentUser(ctx: Context): User {
        if (ctx.auth == null) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token");
        }
        if (ctx.auth.type !== "user") {
            throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
        }
        return ctx.auth.user;
    }

    public static async getAllUsers(query: any): Promise<[Promise<User[]>, Promise<number>]> {
        // TODO
        // * access checks:
        //   if no current user: throw access denied error
        // * only return current user if not admin
        return User.findAll(query);
    }

    public static async registerUser(req: CreateUserReq): Promise<User> {
        // TODO
        // * access checks:
        //   if current user and current user not admin: throw access denied error
        // * validation

        let user = new User();

        user.uid = uuid.v4();
        user.email = req.email;
        user.password = req.password;  // hashes password
        user.lang = req.lang;
        user.first_name = req.first_name;
        user.last_name = req.last_name;
        user.lang = req.lang;

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

    public static async updateUser(uid: string, req: UpdateUserReq): Promise<User> {
        // TODO
        // * validation
        const user = await this.getUser(uid, { selectPassword: true });

        if (req.lang !== undefined) { user.lang = req.lang; }
        if (req.first_name !== undefined) { user.first_name = req.first_name; }
        if (req.last_name !== undefined) { user.last_name = req.last_name; }
        if (req.lang !== undefined) { user.lang = req.lang; }

        if (req.email !== undefined && req.email !== user.email) {
            if (await User.countByEmail(req.email) > 0) {
                throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
            }

            sendMail("account-email-changed", user.lang, [user.email, req.email], {
                old_email: user.email,
                new_email: req.email,
            });

            user.email = req.email;
        }

        if (req.password !== undefined && !await bcrypt.compare(req.password, user.password as string)) {
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

    public static async resetUserPassword(req: ResetPasswordReq): Promise<void> {
        // TODO
        // * replace by sending a token in a link to the auth portal

        // Prevent timing attacks by responding immediatly and doing the actual work in async
        (async () => {
            const user = await User.findByEmail(req.email);
            if (user === undefined) {
                return;
            }

            const password = this.generatePassword();
            user.password = password; // hashes password
            user.save();

            sendMail("account-password-reset", user.lang, user.email, {
                password,
            });
        })();
    }

    private static generatePassword(): string {
        const charset = "abcdefghijklmnopqrstuvwxyz"
            + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            + "0123456789";
        let res = "";
        for (let i = 0; i < 12; ++i) {
            res += charset[Math.floor(charset.length * Math.random())];
        }
        return res;
    }

}
