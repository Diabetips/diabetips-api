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
import { InsulinCreateReq, InsulinUpdateReq, InsulinSearchReq, TimeRangeReq, InsulinCalculationReq } from "../requests";
import { InsulinService } from "../services";

@JsonController("/v1/users/:uid/insulin")
export class UserInsulinController {

    @Get("/calculations")
    @Authorized("user.biometrics:read")
    public async getInsulinCalculations(@Param("uid") uid: string,
                                        @QueryParams() t: TimeRangeReq,
                                        @QueryParams() s: InsulinSearchReq,
                                        @QueryParams() req: InsulinCalculationReq) {
        s.init();
        req.init();
        req.calcs = Array.isArray(req.calcs) ? req.calcs : [req.calcs] || [ ];
        return InsulinService.getCalculations(uid, t, s, req);
    }

    @Get("/")
    @Authorized("user.biometrics:read")
    public async getAllUserInsulin(@Param("uid") uid: string,
                                   @QueryParams() p: Pageable,
                                   @QueryParams() t: Timeable,
                                   @QueryParams() s: InsulinSearchReq,
                                   @Res() res: Response) {
        s.init();
        const page = await InsulinService.getAllInsulin(uid, p, t, s);
        return page.send(res);
    }

    @Post("/")
    @Authorized("user.biometrics:write")
    public async addUserInsulin(@Param("uid") uid: string, @Body() body: InsulinCreateReq) {
        return InsulinService.addInsulin(uid, body);
    }

    @Get("/:id")
    @Authorized("user.biometrics:read")
    public async getUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number) {
        return InsulinService.getInsulin(uid, insulinId);
    }

    @Put("/:id")
    @Authorized("user.biometrics:write")
    public async updateUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number,
                                   @Body() body: InsulinUpdateReq) {
        return InsulinService.updateInsulin(uid, insulinId, body);
    }

    @Delete("/:id")
    @Authorized("user.biometrics:write")
    public async deleteUserInsulin(@Param("uid") uid: string, @Param("id") insulinId: number) {
        await InsulinService.deleteInsulin(uid, insulinId);
    }
}
