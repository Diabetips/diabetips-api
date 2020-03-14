/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";
import { Pageable, Timeable } from "../lib";
import { BloodSugarCreateReq, BloodSugarDeleteReq, BloodSugarUpdateReq } from "../requests";
import { BloodSugarService } from "../services";

@JsonController("/v1/users/:uid/blood_sugar")
export class UserBloodSugarController {

    @Get("/")
    private async getAllUserBloodSugar(@QueryParams() p: Pageable,
                                       @QueryParams() t: Timeable,
                                       @Param("uid") uid: string,
                                       @Res() res: Response) {
        const page = await BloodSugarService.getAllBloodSugar(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    private async addUserBloodSugar(@Param("uid") uid: string,
                                    @Body() body: BloodSugarCreateReq) {
        return BloodSugarService.addBloodSugar(uid, body);
    }

    @Get("/last")
    private async getLastUserBloodSugar(@Param("uid") uid: string) {
        return BloodSugarService.getLastBloodSugar(uid);
    }

    @Put("/")
    private async updateUserBloodSugar(@Param("uid") uid: string,
                                       @Body() body: BloodSugarUpdateReq) {
        return BloodSugarService.updateBloodSugar(uid, body);
    }

    @Delete("/")
    private async deleteUserBloodSugar(@Param("uid") uid: string,
                                       @QueryParams() req: BloodSugarDeleteReq) {
        await BloodSugarService.deleteBloodSugar(uid, req);
    }

}
