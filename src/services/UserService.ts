/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 02 2019
*/

import bcrypt = require("bcrypt");
// tslint:disable-next-line:no-submodule-imports
import uuid = require("uuid/v4");

import { User } from "../entities";

import { ApiError, BaseService, HttpStatus } from "./BaseService";

export class UserService extends BaseService {

    public static async getAllUsers(): Promise<User[]> {
        // todo pagination
        // if no current user throw access denied error
        // check if user has admin rights
        //   if user has admin right: return all users
        //   else return current user only in array
        return User.findAll();
    }

    public static async registerUser(user: User /* maybe replace with interface and copy props*/): Promise<User> {
        // todo validation
        if (await User.countByEmail(user.email) > 0) {
            throw new ApiError(HttpStatus.CONFLICT, "email_conflict", "Email address already used by another account");
        }
        // todo send email
        user.uid = uuid();
        user.password = await bcrypt.hash(user.password, 12);
        return user.save();
    }

}
