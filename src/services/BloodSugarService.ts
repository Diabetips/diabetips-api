/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { BloodSugar, User, BloodSugarCalculation, BloodSugarCalculationType, BloodSugarTarget } from "../entities";
import { BloodSugarCalculationAggregate } from "../entities/BloodSugarCalculationAggregate";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { BloodSugarCreateReq, BloodSugarUpdateReq, TimeRangeReq, BloodSugarTargetFormatReq } from "../requests";
import { BaseService } from "./BaseService";
import { SensorUsageService } from "./SensorUsageService";

export class BloodSugarService extends BaseService {
    public static async getAllBloodSugar(uid: string, p: Pageable, t: Timeable): Promise<Page<BloodSugar>> {
        return BloodSugar.findAllPageable(uid, p, t);
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

        const bsBuilders = req.measures.map(async (m, idx) => {
            const time = new Date(req.start.getTime() + idx * req.interval * 1000);
            let bs = await BloodSugar.findByTime(uid, time);
            if (bs == null) {
                bs = new BloodSugar();
            }
            bs.time = time;
            bs.value = m;
            bs.user = Promise.resolve(user);

            return bs.save();
        });

        await SensorUsageService.addSensorUse(uid);
        return Promise.all(bsBuilders);
    }

    public static async updateBloodSugar(uid: string, req: BloodSugarUpdateReq): Promise<BloodSugar[]> {
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        const bsBuilders = req.measures.map(async (m, idx) => {
            const time = new Date(req.start.getTime() + idx * req.interval * 1000);
            let bs = await BloodSugar.findByTime(uid, time);
            if (bs == null) {
                bs = new BloodSugar();
                bs.time = time;
                bs.user = Promise.resolve(user);
            }

            bs.value = m;

            return bs.save();
        });

        return Promise.all(bsBuilders);
    }

    public static async deleteBloodSugar(uid: string, range: TimeRangeReq) {
        BloodSugar.deleteAllRange(uid, range);
    }

    // ----- Calculations -----

    public static async getCalculations(uid: string,
                                        t: TimeRangeReq,
                                        calcs: BloodSugarCalculationType[]):
                                        Promise<BloodSugarCalculation> {
        const res = new BloodSugarCalculation();
        await res.init(uid, t, calcs);
        return res;
    }

    public static async getCalculationsAggregate(uid: string,
                                                 t: TimeRangeReq,
                                                 calcs: BloodSugarCalculationType[]):
                                                 Promise<BloodSugarCalculationAggregate> {
        const res = new BloodSugarCalculationAggregate();
        await res.init(uid, t, calcs);
        return res;
    }

    public static async getBloodSugarTarget(uid: string,
                                            t: TimeRangeReq,
                                            f: BloodSugarTargetFormatReq):
                                            Promise<BloodSugarTarget> {
            const target = new BloodSugarTarget();
            await target.init(uid, t, f.format);
            return target;
        }
}
