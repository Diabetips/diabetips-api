/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { BloodSugar, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { BloodSugarCreateReq, BloodSugarUpdateReq, TimeRangeDeleteReq } from "../requests";
import { BaseService } from "./BaseService";

export class BloodSugarService extends BaseService {
    public static async getAllBloodSugar(uid: string, p: Pageable, t: Timeable): Promise<Page<BloodSugar>> {
        return BloodSugar.findAll(uid, p, t);
    }

    public static async getLastBloodSugar(uid: string): Promise<BloodSugar> {
        const bs = await BloodSugar.findLast(uid);
        if (bs === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "last_blood_sugar_not_found",
                              `Last blood sugar entry could not be found`);
        }
        return bs;
    }

    public static async addBloodSugar(uid: string, req: BloodSugarCreateReq): Promise<BloodSugar[]> {
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        const bsArray: BloodSugar[] = [];
        let offset = 0;
        for (const m of req.measures) {
            let bs = await BloodSugar.findByTimestamp(uid, req.start + offset);
            if (bs === undefined) {
                bs = new BloodSugar();
            }
            bs.timestamp = req.start + offset;
            bs.value = m;
            bs.user = Promise.resolve(user);

            await bs.save();
            bsArray.push(bs);
            offset += req.interval;
        }
        return bsArray;
    }

    public static async updateBloodSugar(uid: string, req: BloodSugarUpdateReq): Promise<BloodSugar[]> {
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        const bsArray: BloodSugar[] = [];
        let offset = 0;
        for (const m of req.measures) {
            let bs = await BloodSugar.findByTimestamp(uid, req.start + offset);
            if (bs === undefined) {
                bs = new BloodSugar();
                bs.timestamp = req.start + offset;
                bs.user = Promise.resolve(user);
            }
            bs.value = m;

            await bs.save();
            bsArray.push(bs);
            offset += req.interval;
        }
        return bsArray;
    }

    public static async deleteBloodSugar(uid: string, range: TimeRangeDeleteReq) {
        BloodSugar.deleteAllRange(uid, range);
    }
}
