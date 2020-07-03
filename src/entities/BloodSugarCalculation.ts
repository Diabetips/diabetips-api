/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jun 17 2020
*/

import { TimeRangeReq } from "../requests";
import { BloodSugar } from "./BloodSugar";
import { MathUtils } from "../lib";

export enum BloodSugarCalculationType {
    AVERAGE = "average",
    FIRST_QTL = "first",
    THIRD_QTL = "third",
}

export class BloodSugarCalculation {
    public start: number;
    public end: number;
    public average: number;
    public first: number;
    public third: number;

    public async init(uid: string, range: TimeRangeReq, calcs: BloodSugarCalculationType[]) {
        const bloodSugars = await BloodSugar.findAll(uid, range);
        const values: number[] = [];
        let sorted = null;
        bloodSugars.forEach((bs) => values.push(bs.value));

        this.start = range.start;
        this.end = range.end;

        if (calcs.includes(BloodSugarCalculationType.AVERAGE) || calcs.length === 0) {
            this.setAverage(values);
        }
        if (calcs.includes(BloodSugarCalculationType.FIRST_QTL) || calcs.length === 0) {
            sorted = values.sort((a, b) => a - b);
            this.setFirstQuartile(sorted);
        }
        if (calcs.includes(BloodSugarCalculationType.THIRD_QTL) || calcs.length === 0) {
            if (sorted === null) {
                sorted = values.sort((a, b) => a - b);
            }
            this.setThirdQuartile(sorted);
        }
    }

    public setAverage(bloodSugars: number[]) {
        this.average = MathUtils.getAverage(bloodSugars);
    }

    public setFirstQuartile(bloodSugars: number[]) {
        this.first = MathUtils.getFirstQuartile(bloodSugars);
    }

    public setThirdQuartile(bloodSugars: number[]) {
        this.third = MathUtils.getThirdQuartile(bloodSugars);
    }
}