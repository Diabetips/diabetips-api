/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Sep 22 2020
*/

import { SensorUsage, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { BaseService } from "./BaseService";

export class SensorUsageService extends BaseService {
    public static async getAllUses(uid: string, p: Pageable, t: Timeable): Promise<Page<SensorUsage>> {
        return SensorUsage.findAll(uid, p, t);
    }

    public static async getUsesCount(uid: string, t: Timeable): Promise<number> {
        return SensorUsage.getCount(uid, t);
    }

    public static async addSensorUse(uid: string): Promise<SensorUsage> {
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        const use = new SensorUsage();

        use.time = new Date();
        use.user = Promise.resolve(user);

        return use.save();
    }
}