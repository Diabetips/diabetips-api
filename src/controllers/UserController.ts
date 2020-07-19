/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable } from "../lib";
import { UserCreateReq, UserUpdateReq } from "../requests";
import { UserService } from "../services";

@JsonController("/v1/users")
export class UserController {

    @Get("/")
    @Authorized("special:support")
    public async getAllUsers(@QueryParams() p: Pageable, @Res() res: Response) {
        const page = await UserService.getAllUsers(p);
        return page.send(res);
    }

    @Post("/")
    @Authorized("user:create")
    public async registerUser(@Body() req: UserCreateReq) {
        return UserService.registerUser(req);
    }

    @Get("/:uid")
    @Authorized("user.profile:read")
    public async getUser(@Param("uid") uid: string) {
        return UserService.getUser(uid);
    }

    @Put("/:uid")
    @Authorized("user.profile:write")
    public async updateUser(@Param("uid") uid: string, @Body() req: UserUpdateReq) {
        return UserService.updateUser(uid, req);
    }

    @Delete("/:uid")
    @Authorized("user:delete")
    public async deleteUser(@Param("uid") uid: string) {
        await UserService.deleteUser(uid);
    }

}
