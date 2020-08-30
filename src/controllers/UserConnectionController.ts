/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 13 2019
*/

import { Body, Delete, Get, HttpCode, JsonController, Param, Post, Put } from "routing-controllers";

import { Authorized, HttpStatus } from "../lib";
import { UserConnectionInviteReq } from "../requests";
import { UserConnectionService } from "../services";

@JsonController("/v1/users/:uid/connections")
export class UserConnectionController {

    @Get("/")
    @Authorized("connections:read")
    public async getAllConnections(@Param("uid") uid: string) {
        return UserConnectionService.getAllUserConnections(uid);
    }

    @Post("/")
    @HttpCode(HttpStatus.ACCEPTED)
    @Authorized("connections:invite")
    public async inviteUser(@Param("uid") uid: string, @Body() req: UserConnectionInviteReq) {
        await UserConnectionService.inviteUser(uid, req);
    }

    @Put("/:conn_uid")
    @Authorized("connections:write")
    public async acceptConnection(@Param("uid") uid: string, @Param("conn_uid") connectionUid: string) {
        await UserConnectionService.acceptUserConnection(uid, connectionUid);
    }

    @Delete("/:conn_uid")
    @Authorized("connections:write")
    public async deleteConnection(@Param("uid") uid: string, @Param("conn_uid") connectionUid: string) {
        await UserConnectionService.deleteUserConnection(uid, connectionUid);
    }

}
