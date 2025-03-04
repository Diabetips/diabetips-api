/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Delete, Get, JsonController, Param, QueryParams } from "routing-controllers";

import { Authorized } from "../lib";
import { UserAppsSearchReq } from "../requests";
import { AuthService } from "../services";

@JsonController("/v1/users/:uid/apps")
export class UserAppController {

    // INTERNAL
    @Get("/")
    @Authorized("apps:read")
    public async getAllUserApps(@Param("uid") uid: string, @QueryParams() req: UserAppsSearchReq) {
        return AuthService.getAllAuthorizedUserApps(uid, req);
    }

    // INTERNAL
    @Delete("/:appid")
    @Authorized("apps:write")
    public async deauthorizeApp(@Param("uid") uid: string, @Param("appid") appid: string) {
        await AuthService.deauthorizeUserApp(uid, appid);
    }

}
