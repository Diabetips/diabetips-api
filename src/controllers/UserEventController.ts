/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { JsonController, Param, QueryParams, Get, Post, Res, Body, Put, Delete } from "routing-controllers";
import { Timeable, Pageable } from "../lib";
import { Response } from "express";
import { EventService } from "../services";
import { EventCreateReq, EventUpdateReq } from "../requests";

@JsonController("/v1/users/:uid/events")
export class UserEventController {
    @Get("/")
    public async getAllEvents(@Param("uid") uid: string,
                              @QueryParams() p: Pageable,
                              @QueryParams() t: Timeable,
                              @Res() res: Response) {
        const page = await EventService.getAllEvents(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    public async createEvent(@Param("uid") uid: string, @Body() body: EventCreateReq) {
        return EventService.addEvent(uid, body);
    }

    @Get("/:id")
    public async getEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        return EventService.getEvent(uid, eventId);
    }

    @Put("/:id")
    public async updateEvent(@Param("uid") uid: string,
                             @Param("id") eventId: number,
                             @Body() body: EventUpdateReq) {
        return EventService.updateEvent(uid, eventId, body);
    }

    @Delete("/:id")
    public async deleteEvent(@Param("uid") uid: string, @Param("id") eventId: number) {
        await EventService.deleteEvent(uid, eventId);
    }
}
