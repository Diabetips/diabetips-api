/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import { PhysicalActivity } from "../entities/PhysicalActivity";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { PhysicalActivityCreateReq, PhysicalActivityUpdateReq } from "../requests";
import { UserService } from "./UserService";

export class PhysicalActivityService {

    public static async getAllActivities(uid: string,
                                         p: Pageable,
                                         t: Timeable):
                                         Promise<Page<PhysicalActivity>> {
        return PhysicalActivity.findAllPageable(uid, p, t);
    }

    public static async getActivity(uid: string, activityId: number): Promise<PhysicalActivity> {
        const activity = await PhysicalActivity.findById(uid, activityId);

        if (activity === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "physical_activity_not_found", `Physical activity ${activityId} not found`);
        }
        return activity;
    }

    public static async addActivity(uid: string, req: PhysicalActivityCreateReq): Promise<PhysicalActivity> {
        const user = await UserService.getUser(uid);

        const activity = new PhysicalActivity();
        activity.title = req.title;
        activity.description = req.description;
        activity.type = req.type;
        activity.intensity = req.intensity;
        activity.calories = req.calories;
        activity.start = req.start;
        activity.end = req.end;
        activity.user = Promise.resolve(user);

        return activity.save();
    }

    public static async updateActivity(uid: string, activityId: number, req: PhysicalActivityUpdateReq): Promise<PhysicalActivity> {
        const activity = await this.getActivity(uid, activityId);

        if (req.title !== undefined) { activity.title = req.title; }
        if (req.description !== undefined) { activity.description = req.description; }
        if (req.type !== undefined) { activity.type = req.type; }
        if (req.intensity !== undefined) { activity.intensity = req.intensity; }
        if (req.calories !== undefined) { activity.calories = req.calories; }
        if (req.start !== undefined) { activity.start = req.start; }
        if (req.end !== undefined) { activity.end = req.end; }

        return activity.save();
    }

    public static async deleteActivity(uid: string, activityId: number) {
        const activity = await this.getActivity(uid, activityId);
        activity.deleted = true;
        return activity.save();
    }
}
