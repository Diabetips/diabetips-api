/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { AuthApp } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";

export class AuthAppService extends BaseService {

    public static async getAllApps(): Promise<AuthApp[]> {
        return AuthApp.findAll();
    }

    public static async getApp(appid: string): Promise<AuthApp> {
        const app = await AuthApp.findByAppid(appid);
        if (app === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "app_not_found", `App ${appid} not found`);
        }
        return app;
    }

}
