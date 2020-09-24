/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { PeriodMode, Timeable } from "../lib";

export class TimeRangeReq extends Timeable {
    public start: Date;
    public end: Date;

    public splitToPeriods(mode: PeriodMode): TimeRangeReq[] {
        const res: TimeRangeReq[] = [];
        const start = new Date(this.start);
        let end;
        let inc;

        if (mode === PeriodMode.DAILY) {
            start.setHours(0, 0, 0, 0);
            inc = (d: Date) => {d.setDate(d.getDate() + 1)}
        } else {
            start.setHours(start.getHours(), 0, 0, 0);
            inc = (d: Date) => {d.setHours(d.getHours() + 1)}
        }

        end = new Date(start);
        end.setMilliseconds(-1);
        inc(end);

        while (start < this.end) {
            const report = new TimeRangeReq()
            report.start = new Date(start)
            report.end = new Date(end)
            res.push(report)
            inc(start)
            inc(end)
        }

        return res
    }
}
