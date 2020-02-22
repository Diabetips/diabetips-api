/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import { NextFunction, Request, Response } from "express";
import { All, Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res, UseBefore } from "routing-controllers";

import { Pageable } from "../lib";
import { UserCreateReq, UserUpdateReq } from "../requests";
import { UserService } from "../services";

import { BaseController } from "./BaseController";

@JsonController("/v1/users")
export class UserController extends BaseController {

    @All(/\/me(\/.*)?/)
    @UseBefore((req: Request, res: Response, next: NextFunction) => {
        req.url = "/" + UserService.getCurrentUser(req.context).uid + req.url.slice(3);
        next("route");
    })
    private _() {
        throw Error("Unreachable code");
    }

    @Get("/")
    private async getAllUsers(@QueryParams() p: Pageable, @Res() res: Response) {
        const page = await UserService.getAllUsers(p);
        return page.send(res);
    }

    @Post("/")
    private async registerUser(@Body() req: UserCreateReq) {
        return UserService.registerUser(req);
    }

    @Get("/:uid")
    private async getUser(@Param("uid") uid: string) {
        return UserService.getUser(uid);
    }

    @Put("/:uid")
    private async updateUser(@Param("uid") uid: string, @Body() req: UserUpdateReq) {
        return UserService.updateUser(uid, req);
    }

    @Delete("/:uid")
    private async deleteUser(@Param("uid") uid: string) {
        await UserService.deleteUser(uid);
    }

}
