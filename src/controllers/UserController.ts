/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res, UseBefore } from "routing-controllers";

import { Pageable } from "../lib";
import { UserCreateReq, UserUpdateReq } from "../requests";
import { UserService } from "../services";

@JsonController("/v1/users")
export class UserController {

    @Get("/")
    public async getAllUsers(@QueryParams() p: Pageable, @Res() res: Response) {
        const page = await UserService.getAllUsers(p);
        return page.send(res);
    }

    @Post("/")
    public async registerUser(@Body() req: UserCreateReq) {
        return UserService.registerUser(req);
    }

    @Get("/:uid")
    public async getUser(@Param("uid") uid: string) {
        return UserService.getUser(uid);
    }

    @Put("/:uid")
    public async updateUser(@Param("uid") uid: string, @Body() req: UserUpdateReq) {
        return UserService.updateUser(uid, req);
    }

    @Delete("/:uid")
    public async deleteUser(@Param("uid") uid: string) {
        await UserService.deleteUser(uid);
    }

}
