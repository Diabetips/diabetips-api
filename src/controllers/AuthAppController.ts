/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Get, JsonController, Param } from "routing-controllers";

import { AuthAppService } from "../services";

@JsonController("/v1/auth/apps")
export class AuthAppController {

    // DEBUG
    @Get("/")
    public async getAllApps() {
        return AuthAppService.getAllApps();
    }

    @Get("/:appid")
    public async getApp(@Param("appid") appid: string) {
        return AuthAppService.getApp(appid);
    }

}
