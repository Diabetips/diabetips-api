/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Jul 14 2020
*/

import { InsulinCalculationItem } from "./InsulinCalculationItem";
import { TimeRangeReq, InsulinCalculationReq, InsulinSearchReq } from "../requests";
import { Insulin, InsulinType } from "./Insulin";

export enum InsulinCalculationType {
    AVERAGE = "average",
    COUNT = "count",
}

export class InsulinCalculation {
    public start: Date;
    public end: Date;
    public average: InsulinCalculationItem[];
    public count: InsulinCalculationItem[];

    public async init(uid: string, range: TimeRangeReq, s: InsulinSearchReq, req: InsulinCalculationReq) {
        range.start.setHours(0, 0, 0, 0);
        range.end.setHours(23, 59, 59, 999);

        this.start = range.start;
        this.end = range.end;

        const insulins = await Insulin.findAll(uid, range, s);

        const hourly = this.getHourlyArray(insulins);
        if (req.calcs.includes(InsulinCalculationType.AVERAGE) || req.calcs.length === 0) {
            this.setAverage(hourly, s);
        }
        if (req.calcs.includes(InsulinCalculationType.COUNT) || req.calcs.length === 0) {
            this.setCount(hourly, s);
        }
    }

    public setAverage(hourly: Insulin[][], s: InsulinSearchReq) {
        this.average = new Array<InsulinCalculationItem>(24);
        for (let i = 0; i < hourly.length; i++) {
            this.average[i] = new InsulinCalculationItem();
            let slow = 0;
            let slow_count = 0;
            let fast = 0;
            let fast_count = 0;
            let very_fast = 0;
            let very_fast_count = 0;
            for (const ins of hourly[i]) {
                switch (ins.type) {
                    case InsulinType.SLOW:
                        slow += ins.quantity;
                        slow_count++;
                        break;
                    case InsulinType.FAST:
                        fast += ins.quantity;
                        fast_count++;
                        break;
                    case InsulinType.VERY_FAST:
                        very_fast += ins.quantity;
                        very_fast_count++;
                        break;
                }
            }
            if (s.types?.includes(InsulinType.SLOW) || s.types === undefined) {
                this.average[i].slow = slow / (slow_count === 0 ? 1 : slow_count);
            }
            if (s.types?.includes(InsulinType.FAST) || s.types === undefined) {
                this.average[i].fast = fast / (fast_count === 0 ? 1 : fast_count);
            }
            if (s.types?.includes(InsulinType.VERY_FAST) || s.types === undefined) {
                this.average[i].very_fast = very_fast / (very_fast_count === 0 ? 1 : very_fast_count);
            }
        }
    }

    public setCount(hourly: Insulin[][], s: InsulinSearchReq) {
        this.count = new Array<InsulinCalculationItem>(24);
        for (let i = 0; i < hourly.length; i++) {
            this.count[i] = new InsulinCalculationItem();
            if (s.types?.includes(InsulinType.SLOW) || s.types === undefined) {
                this.count[i].slow = 0;
            }
            if (s.types?.includes(InsulinType.FAST) || s.types === undefined) {
                this.count[i].fast = 0;
            }
            if (s.types?.includes(InsulinType.VERY_FAST) || s.types === undefined) {
                this.count[i].very_fast = 0;
            }
            for (const ins of hourly[i]) {
                switch (ins.type) {
                    case InsulinType.SLOW:
                        this.count[i].slow++;
                        break;
                    case InsulinType.FAST:
                        this.count[i].fast++;
                        break;
                    case InsulinType.VERY_FAST:
                        this.count[i].very_fast++;
                        break;
                }
            }
        }
    }

    private getHourlyArray(insulins: Insulin[]): Insulin[][] {
        const hourly = new Array<Insulin[]>(24);
        for (let i = 0; i < hourly.length; i++) {
            hourly[i] = new Array<Insulin>();
        }

        for (const ins of insulins) {
            const date = ins.time;
            const hour = (date.getHours()) % 24;
            hourly[hour].push(ins);
        }
        return hourly;
    }
}