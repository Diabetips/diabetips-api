/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Request, Response } from "express";
import { HttpStatus } from "../lib";
import { BaseController } from "./BaseController";

export class UserEventController extends BaseController {

    private static dummy = {
        description: "this is an event's description",
        start: 1581693368,
        end: 1581696111,
    };

    constructor() {
        super();

        this.router
        .get("/:userUid/events",                         this.getAllEvents)
        .post("/:userUid/events",       this.jsonParser, this.createEvent)
        .get("/:userUid/events/:id",                     this.getEvent)
        .put("/:userUid/events/:id",    this.jsonParser, this.updateEvent)
        .delete("/:userUid/events/:id",                  this.deleteEvent);
    }

    private async getAllEvents(req: Request, res: Response) {
        res.send([UserEventController.dummy]);
    }

    private async createEvent(req: Request, res: Response) {
        res.send(UserEventController.dummy);
    }

    private async getEvent(req: Request, res: Response) {
        res.send(UserEventController.dummy);
    }

    private async updateEvent(req: Request, res: Response) {
        res.send(UserEventController.dummy);
    }

    private async deleteEvent(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
