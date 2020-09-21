/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res  } from "routing-controllers";

import { Authorized, Pageable, Timeable } from "../lib";
import { EventService } from "../services";
import { EventCreateReq, EventUpdateReq } from "../requests";

@JsonController("/v1/users/:uid/events")
export class UserEventController {

    @Get("/")
    @Authorized("notes:read")
    public async getAllEvents(@Param("uid") uid: string,
                              @QueryParams() p: Pageable,
                              @QueryParams() t: Timeable,
                              @Res() res: Response) {
        const page = await EventService.getAllEvents(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    @Authorized("notes:write")
    public async createEvent(@Param("uid") uid: string, @Body() body: EventCreateReq) {
        return EventService.addEvent(uid, body);
    }

    @Get("/:id")
    @Authorized("notes:read")
    public async getEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        return EventService.getEvent(uid, eventId);
    }

    @Put("/:id")
    @Authorized("notes:write")
    public async updateEvent(@Param("uid") uid: string,
                             @Param("id") eventId: number,
                             @Body() body: EventUpdateReq) {
        return EventService.updateEvent(uid, eventId, body);
    }

    @Delete("/:id")
    @Authorized("notes:write")
    public async deleteEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        await EventService.deleteEvent(uid, eventId);
    }
}
