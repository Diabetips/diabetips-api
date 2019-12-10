/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { AuthApp } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

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

    public static async getAllUserApps(uid: string): Promise<AuthApp[]> {
        return (await UserService.getUser(uid)).apps;
    }

    public static async deauthorizeUserApp(uid: string, appid: string) {
        const user = await UserService.getUser(uid);
        const apps = await user.apps;
        if (apps.find((val) => val.appid === appid) == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "app_not_found", `App ${appid} not authorized by this user`);
        }

        user.apps = Promise.resolve(apps.filter((val) => val.appid !== appid));
        await user.save();
    }

}
