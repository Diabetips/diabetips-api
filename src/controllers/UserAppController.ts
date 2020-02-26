/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Delete, Get, JsonController, Param } from "routing-controllers";

import { AuthAppService } from "../services";

@JsonController("/v1/users/:uid/apps")
export class UserAppController {

    @Get("/")
    private async getAllUserApps(@Param("uid") uid: string) {
        return AuthAppService.getAllUserApps(uid);
    }

    @Delete("/:appid")
    private async deauthorizeApp(@Param("uid") uid: string, @Param("appid") appid: string) {
        await AuthAppService.deauthorizeUserApp(uid, appid);
    }

}
