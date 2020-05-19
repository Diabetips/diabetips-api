/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { BaseService } from "./BaseService";
import { Pageable, Timeable, Page, HttpStatus } from "../lib";
import { User, Event } from "../entities";
import { ApiError } from "../errors";
import { EventCreateReq, EventUpdateReq } from "../requests";

export class EventService extends BaseService {
    public static async getAllEvents(uid: string, p: Pageable, t: Timeable): Promise<Page<Event>> {
        return Event.findAll(uid, p, t);
    }

    public static async getEvent(userUid: string, eventId: number): Promise<Event> {
        const event = await Event.findById(userUid, eventId);
        if (event === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "event_not_found", `Event ${eventId} not found`);
        }
        return event;
    }

    public static async addEvent(userUid: string, req: EventCreateReq): Promise<Event> {
        // Get the user
        const user = await User.findByUid(userUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${userUid}) not found`);
        }

        // Add Event
        const event = new Event();
        event.start = req.start;
        if (req.end !== undefined) { event.end = req.end; }
        event.description = req.description;
        event.user = Promise.resolve(user);

        return event.save();
    }

    public static async updateEvent(userUid: string, eventId: number, req: EventUpdateReq): Promise<Event> {
        const event = await Event.findById(userUid, eventId);

        if (event === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "event_not_found", `Event (${eventId}) or User (${userUid}) not found`);
        }

        if (req.description !== undefined) { event.description = req.description; }
        if (req.start !== undefined) { event.start = req.start; }
        if (req.end !== undefined) { event.end = req.end; }

        return event.save();
    }

    public static async deleteEvent(userUid: string, eventId: number) {
        const event = await Event.findById(userUid, eventId);

        if (event === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "event_not_found", `Event (${eventId}) or User (${userUid}) not found`);
        }
        event.deleted = true;
        return event.save();
    }
}
