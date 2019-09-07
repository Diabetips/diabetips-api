/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 02 2019
*/

import bcrypt = require("bcrypt");
import uuid = require("uuid");

import { User } from "../entities";
import { mail, render } from "../mail";
import { ApiError, BaseService, HttpStatus } from "./BaseService";

export interface ICreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface IUpdateUserRequest {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
}

export interface IResetPasswordRequest {
    email: string;
}

export class UserService extends BaseService {

    public static async getAllUsers(): Promise<User[]> {
        // TODO
        // * pagination
        // * access checks:
        //   if no current user: throw access denied error
        // * only return current user if not admin
        return User.findAll();
    }

    public static async registerUser(req: ICreateUserRequest): Promise<User> {
        // TODO
        // * access checks:
        //   if current user and current user not admin: throw access denied error
        // * validation

        const user = new User();

        user.uid = uuid.v4();
        user.email = req.email;
        user.password = req.password;  // hash password
        user.first_name = req.first_name;
        user.last_name = req.last_name;

        if (await User.countByEmail(user.email) > 0) {
            throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
        }

        mail.sendMail({
            to: user.email,
            subject: "Bienvenue sur Diabetips !",
            html: render("account-registration", { email: user.email }),
        });

        return user.save();
    }

    public static async getUser(uid: string): Promise<User> {
        // TODO
        // * access checks:
        //   if no current user: throw access denied error
        //   if current user uid != uid or current user not admin: throw not found
        const user = await User.findByUid(uid);
        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${uid} not found`);
        }
        return user;
    }

    public static async updateUser(uid: string, req: IUpdateUserRequest): Promise<User> {
        // TODO
        // * validation
        const user = await this.getUser(uid);

        if (req.first_name !== undefined) { user.first_name = req.first_name; }
        if (req.last_name !== undefined) { user.last_name = req.last_name; }

        if (req.email !== undefined && req.email !== user.email) {
            if (await User.countByEmail(user.email) > 0) {
                throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
            }

            mail.sendMail({
                to: [ user.email, req.email ],
                subject: "Changement de votre adresse email",
                html: render("account-email-changed", { oldEmail: user.email, newEmail: req.email }),
            });

            user.email = req.email;
        }

        if (req.password !== undefined && await bcrypt.compare(req.password, user.password)) {
            mail.sendMail({
                to: user.email,
                subject: "Changement de votre mot de passe",
                html: render("account-password-changed"),
            });

            user.password = req.password; // hash password
        }

        return user.save();
    }

    public static async deleteUser(uid: string): Promise<void> {
        const user = await this.getUser(uid); // getUser handles access checks
        user.deleted = true;
        user.save();
    }

    public static async resetUserPassword(req: IResetPasswordRequest): Promise<void> {
        // TODO
        // * replace by sending a token in a link to the auth portal
        // run in async to prevent timing attacks
        (async () => {
            const user = await User.findByEmail(req.email);
            if (user === undefined) {
                return;
            }

            const password = this.generatePassword();
            user.password = password; // hash password
            user.save();

            mail.sendMail({
                to: user.email,
                subject: "Réinitialisation de votre mot de passe",
                html: render("account-password-reset", { password }),
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
