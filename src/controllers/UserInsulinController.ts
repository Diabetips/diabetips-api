/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Pageable, Timeable } from "../lib";
import { InsulinCreateReq, InsulinUpdateReq } from "../requests";
import { InsulinService } from "../services";

@JsonController("/v1/users/:uid/insulin")
export class UserInsulinController {

    @Get("/")
    public async getAllUserInsulin(@Param("uid") uid: string,
                                   @QueryParams() p: Pageable,
                                   @QueryParams() t: Timeable,
                                   @Res() res: Response) {
        const page = await InsulinService.getAllInsulin(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    public async addUserInsulin(@Param("uid") uid: string, @Body() body: InsulinCreateReq) {
        return InsulinService.addInsulin(uid, body);
    }

    @Get("/:id")
    public async getUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number) {
        return InsulinService.getInsulin(uid, insulinId);
    }

    @Put("/:id")
    public async updateUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number,
                                   @Body() body: InsulinUpdateReq) {
        return InsulinService.updateInsulin(uid, insulinId, body);
    }

    @Delete("/:id")
    public async deleteUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number) {
        await InsulinService.deleteInsulin(uid, insulinId);
    }

}
