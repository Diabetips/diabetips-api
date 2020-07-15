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
import { BloodSugarCreateReq, BloodSugarUpdateReq, TimeRangeReq, BloodSugarTargetFormatReq } from "../requests";
import { BloodSugarService } from "../services";
import { BloodSugarCalculationReq } from "../requests/BloodSugarCalculationReq";
import { BloodSugarCalculationType } from "../entities";

@JsonController("/v1/users/:uid/blood_sugar")
export class UserBloodSugarController {

    @Get("/")
    public async getAllUserBloodSugar(@QueryParams() p: Pageable,
                                      @QueryParams() t: Timeable,
                                      @Param("uid") uid: string,
                                      @Res() res: Response) {
        const page = await BloodSugarService.getAllBloodSugar(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    public async addUserBloodSugar(@Param("uid") uid: string,
                                   @Body() body: BloodSugarCreateReq) {
        return BloodSugarService.addBloodSugar(uid, body);
    }

    @Get("/last")
    public async getLastUserBloodSugar(@Param("uid") uid: string) {
        return BloodSugarService.getLastBloodSugar(uid);
    }

    @Put("/")
    public async updateUserBloodSugar(@Param("uid") uid: string,
                                      @Body() body: BloodSugarUpdateReq) {
        return BloodSugarService.updateBloodSugar(uid, body);
    }

    @Delete("/")
    public async deleteUserBloodSugar(@Param("uid") uid: string,
                                      @QueryParams() req: TimeRangeReq) {
        await BloodSugarService.deleteBloodSugar(uid, req);
    }

    // ----- Calculations -----

    @Get("/calculations")
    public async getBloodSugarCalculations(@Param("uid") uid: string,
                                           @QueryParams() t: TimeRangeReq,
                                           @QueryParams() { calcs }: BloodSugarCalculationReq) {
        // TODO: Refactor this part to be cleaner like the others
        const values: BloodSugarCalculationType[] = Array.isArray(calcs) ? calcs : [calcs] || [ ];
        return BloodSugarService.getCalculations(uid, t, values);
    }

    @Get("/target")
    public async getBloodSugarTarget(@Param("uid") uid: string,
                                     @QueryParams() t: TimeRangeReq,
                                     @QueryParams() f: BloodSugarTargetFormatReq) {
        return BloodSugarService.getBloodSugarTarget(uid, t, f);
    }
}