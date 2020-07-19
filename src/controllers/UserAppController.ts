/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Delete, Get, JsonController, Param } from "routing-controllers";

import { Authorized } from "../lib";
import { AuthService } from "../services";

@JsonController("/v1/users/:uid/apps")
export class UserAppController {

    // INTERNAL
    @Get("/")
    @Authorized("user.apps:read")
    public async getAllUserApps(@Param("uid") uid: string) {
        return AuthService.getAllAuthorizedUserApps(uid);
    }

    // INTERNAL
    @Delete("/:appid")
    @Authorized("user.apps:write")
    public async deauthorizeApp(@Param("uid") uid: string, @Param("appid") appid: string) {
        await AuthService.deauthorizeUserApp(uid, appid);
    }

}
