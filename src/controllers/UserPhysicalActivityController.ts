/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";
import { Authorized, Pageable, Timeable } from "../lib";
import { PhysicalActivityCreateReq, PhysicalActivityUpdateReq } from "../requests";
import { PhysicalActivityService } from "../services";

@JsonController('/v1/users/:uid/activity')
export class UserPhysicalActivityController {

    @Get("/")
    @Authorized("biometrics:read")
    public async getAllPhysicalActivities(@Param("uid") uid: string,
                                          @QueryParams() p: Pageable,
                                          @QueryParams() t: Timeable,
                                          @Res() res: Response) {
        const page = await PhysicalActivityService.getAllActivities(uid, p, t)
        return page.send(res);
    }

    @Get("/:id")
    @Authorized("biometrics:read")
    public async getPhysicalActivity(@Param("uid") uid: string,
                                     @Param("id") activityId: number) {
        return PhysicalActivityService.getActivity(uid, activityId);
    }

    @Post("/")
    @Authorized("biometrics:write")
    public async addPhysicalActivity(@Param("uid") uid: string,
                                     @Body() req: PhysicalActivityCreateReq) {
        return PhysicalActivityService.addActivity(uid, req);
    }

    @Put("/:id")
    @Authorized("biometrics:write")
    public async updatePhysicalActivity(@Param("uid") uid: string,
                                        @Param("id") activityId: number,
                                        @Body() req: PhysicalActivityUpdateReq) {
        return PhysicalActivityService.updateActivity(uid, activityId, req);
    }

    @Delete("/:id")
    @Authorized("biometrics:write")
    public async deletePhysicalActivity(@Param("uid") uid: string,
                                        @Param("id") activityId: number) {
        await PhysicalActivityService.deleteActivity(uid, activityId)
    }
}