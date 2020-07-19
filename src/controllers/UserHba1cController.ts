/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable, Timeable } from "../lib";
import { Hba1cCreateReq, Hba1cUpdateReq } from "../requests";
import { Hba1cService } from "../services";

@JsonController("/v1/users/:uid/hba1c")
export class UserHba1cController {

    @Get("/")
    @Authorized("user.biometrics:read")
    public async getAllUserHba1c(@Param("uid") uid: string,
                                 @QueryParams() p: Pageable,
                                 @QueryParams() t: Timeable,
                                 @Res() res: Response) {
        const page = await Hba1cService.getAllHba1c(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    @Authorized("user.biometrics:write")
    public async addUserHba1c(@Param("uid") uid: string, @Body() body: Hba1cCreateReq) {
        return Hba1cService.addHba1c(uid, body);
    }

    @Get("/:id")
    @Authorized("user.biometrics:read")
    public async getUserHba1c(@Param("uid") uid: string, @Param("id") hba1cId: number) {
        return Hba1cService.getHba1c(uid, hba1cId);
    }

    @Put("/:id")
    @Authorized("user.biometrics:write")
    public async updateUserHba1c(@Param("uid") uid: string,
                                 @Param("id") hba1cId: number,
                                 @Body() body: Hba1cUpdateReq) {
        return Hba1cService.updateHba1c(uid, hba1cId, body);
    }

    @Delete("/:id")
    @Authorized("user.biometrics:write")
    public async deleteUserHba1c(@Param("uid") uid: string, @Param("id") hba1cId: number) {
        await Hba1cService.deleteHba1c(uid, hba1cId);
    }

}
