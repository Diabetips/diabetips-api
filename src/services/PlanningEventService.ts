/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Nov 14 2020
*/

import { PlanningEvent } from "../entities/PlanningEvent";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { PlanningEventCreateReq } from "../requests/PlanningEventCreateReq";
import { PlanningEventUpdateReq } from "../requests/PlanningEventUpdateReq";
import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class PlanningEventService extends BaseService {
    public static async getAllPlanningEvents(uid: string,
                                             p: Pageable,
                                             t: Timeable):
                                             Promise<Page<PlanningEvent>> {
        return PlanningEvent.findAll(uid, p, t);
    }

    public static async getPlanningEvent(uid: string, eventId: number): Promise<PlanningEvent> {
        const event = await PlanningEvent.findById(uid, eventId);
        if (event === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "planning_event_not_found", `Planning event ${eventId} not found`)
        }

        return event;
    }

    public static async createPlanningEvent(uid: string, req: PlanningEventCreateReq): Promise<PlanningEvent> {
        const event = new PlanningEvent();
        const owner = await UserService.getUser(uid)

        event.title = req.title;
        event.description = req.description;
        event.start = req.start;
        event.end = req.end;
        event.owner = owner;

        event.members = [];
        const reqMembers: string[] = req.members || [];

        for (const memberUid of reqMembers) {
            const member = await UserService.getUser(memberUid);
            event.members.push(member);
        }

        if (!event.isValid()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_event", `An event cannot end before it started`);
        }
        return event.save();
    }

    public static async updatePlanningEvent(uid: string,
                                            eventId: number,
                                            req: PlanningEventUpdateReq): Promise<PlanningEvent> {
        const event = await this.getPlanningEvent(uid, eventId);

        if (req.title !== undefined) { event.title = req.title; }
        if (req.description !== undefined) { event.description = req.description; }
        if (req.start !== undefined) { event.start = req.start; }
        if (req.end !== undefined) { event.end = req.end; }

        if (req.members !== undefined) {
            event.members = [];
            for (const memberUid of req.members) {
                const member = await UserService.getUser(memberUid);
                event.members.push(member);
            }
        }
        if (!event.isValid()) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_event", `An event cannot end before it started`);
        }

        return event.save();
    }

    public static async deletePlanningEvent(userUid: string, eventId: number) {
        const event = await this.getPlanningEvent(userUid, eventId);

        event.deleted = true;
        return event.save();
    }
}