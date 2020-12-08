/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Nov 14 2020
*/

import { Response } from "express";
import { Authorized, Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";
import { Pageable, Timeable } from "../lib";
import { PlanningEventCreateReq } from "../requests/PlanningEventCreateReq";
import { PlanningEventUpdateReq } from "../requests/PlanningEventUpdateReq";
import { PlanningEventService } from "../services/PlanningEventService";

@JsonController("/v1/users/:uid/planning")
export class UserPlanningEventController {

    @Get("/")
    @Authorized("notes:read")
    public async getAllPlanningEvents(@Param("uid") uid: string,
                                      @QueryParams() p: Pageable,
                                      @QueryParams() t: Timeable,
                                      @Res() res: Response) {
        const page = await PlanningEventService.getAllPlanningEvents(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    @Authorized("notes:write")
    public async createPlanningEvent(@Param("uid") uid: string, @Body() body: PlanningEventCreateReq) {
        return PlanningEventService.createPlanningEvent(uid, body);
    }

    @Get("/:id")
    @Authorized("notes:read")
    public async getPlanningEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        return PlanningEventService.getPlanningEvent(uid, eventId);
    }

    @Put("/:id")
    @Authorized("notes:write")
    public async upadtePlanningEvent(@Param("uid") uid: string,
                                     @Param("id") id: number,
                                     @Body() body: PlanningEventUpdateReq) {
        return PlanningEventService.updatePlanningEvent(uid, id, body);
    }

    @Delete("/:id")
    @Authorized("notes:write")
    public async deletePlanningEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        await PlanningEventService.deletePlanningEvent(uid, eventId);
    }
}