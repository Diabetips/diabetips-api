/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Get, JsonController, Param } from "routing-controllers";

import { Authorized } from "../lib";
import { AuthAppService } from "../services";

@JsonController("/v1/auth/apps")
export class AuthAppController {

    @Get("/")
    @Authorized("app:read")
    public async getAllApps() {
        return AuthAppService.getAllApps();
    }

    @Get("/:appid")
    @Authorized("app:read")
    public async getApp(@Param("appid") appid: string) {
        return AuthAppService.getApp(appid);
    }

}
