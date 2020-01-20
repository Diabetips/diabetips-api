/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jan 19 2020
*/

import uuid = require("uuid");

import { User, UserConfirmation } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";

interface IUserConfirmationRequest {
    code: string;
}

export class UserConfirmationService extends BaseService {

    public static async createUserConfirmation(user: User): Promise<UserConfirmation> {
        const confirm = new UserConfirmation();
        confirm.user = Promise.resolve(user);
        confirm.code = uuid.v4();
        return confirm.save();
    }

    public static async confirmUserAccount(req: IUserConfirmationRequest) {
        const confirm = await UserConfirmation.findByCode(req.code);
        if (confirm === undefined) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_code", "Invalid confirmation code");
        }
        confirm.code = null;
        confirm.confirmed = true;
        await confirm.save();
    }

}
