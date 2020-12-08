/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import moment = require("moment");
import { MathUtils } from "../lib";
import { TimeRangeReq } from "../requests";
import { UserService } from "../services";
import { BloodSugar } from "./BloodSugar";
import { BloodSugarCalculationType } from "./BloodSugarCalculation";

export class BloodSugarCalculationAggregate {
    public start: Date;
    public end: Date;
    public average: number[];
    public first: number[];
    public third: number[];

    public async init(uid: string, range: TimeRangeReq, calcs: BloodSugarCalculationType[]) {
        range.start.setHours(0, 0, 0, 0);
        range.end.setHours(23, 59, 59, 999);

        this.start = range.start;
        this.end = range.end;

        const records = await BloodSugar.findAll(uid, range);

        const user = await UserService.getUser(uid);
        const timezone = user.timezone;

        const hourly = this.getHourlyArray(records, timezone);

        for (let i = 0; i < hourly.length; i++) {
            hourly[i] = hourly[i].sort((a, b) => a - b);
        }

        if (calcs.includes(BloodSugarCalculationType.AVERAGE) || calcs.length === 0) {
            this.setAverage(hourly);
        }
        if (calcs.includes(BloodSugarCalculationType.FIRST_QTL) || calcs.length === 0) {
            this.setFirstQuartile(hourly);
        }
        if (calcs.includes(BloodSugarCalculationType.THIRD_QTL) || calcs.length === 0) {
            this.setThirdQuartile(hourly);
        }
    }

    public setAverage(hourly: number[][]) {
        this.average = new Array<number>(24);
        for (let i = 0; i < hourly.length; i++) { 
            this.average[i] = MathUtils.getAverage(hourly[i]);
        }
    }

    public setFirstQuartile(hourly: number[][]) {
        this.first = new Array<number>(24);
        for (let i = 0; i < hourly.length; i++) { 
            this.first[i] = MathUtils.getFirstQuartile(hourly[i]);
        }
    }

    public setThirdQuartile(hourly: number[][]) {
        this.third = new Array<number>(24);
        for (let i = 0; i < hourly.length; i++) { 
            this.third[i] = MathUtils.getThirdQuartile(hourly[i]);
        }
    }

    private getHourlyArray(records: BloodSugar[], timezone: string): number[][] {
        const hourly = new Array<number[]>(24);

        for (let i = 0; i < hourly.length; i++) {
            hourly[i] = new Array<number>();
        }

        for (const bs of records) {
            const date = moment.utc(bs.time).tz(timezone);
            const hour = (date.hours()) % 24;
            hourly[hour].push(bs.value);
        }
        return hourly;
    }
}
