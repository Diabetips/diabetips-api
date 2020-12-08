/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Aug 29 2020
*/

import { BaseService } from "./BaseService";
import { BloodSugarService } from "./BloodSugarService";
import { BiometricReport, BiometricReportCalculationType,  InsulinReport } from "../entities";
import { PeriodMode } from "../lib";
import { InsulinSearchReq, TimeRangeReq } from "../requests";
import { BiometricReportCalcsReq } from "../requests/BiometricReportCalcsReq";

export class BiometricReportService extends BaseService {
    public static async getReport(uid: string,
                                  t: TimeRangeReq,
                                  d: BiometricReportCalcsReq,
                                  mode: PeriodMode):
                                  Promise<BiometricReport[]> {
        const periods = t.splitToPeriods(mode)
        return this.getFilledReports(uid, d, periods);
    }

    private static async getFilledReports(uid: string, d: BiometricReportCalcsReq, periods: TimeRangeReq[]): Promise<BiometricReport[]> {
        const reports: BiometricReport[] = []
        for (const period of periods) {
            const report = new BiometricReport();
            if (d.data.includes(BiometricReportCalculationType.BLOOD_SUGAR) || d.data.length === 0) {
                report.blood_sugar = await BloodSugarService.getCalculations(uid, period, []);
            }
            if (d.data.includes(BiometricReportCalculationType.INSULIN) || d.data.length === 0) {
                const insulinReport = new InsulinReport();
                await insulinReport.init(uid, period, new InsulinSearchReq());
                report.insulin = insulinReport;
            }
            reports.push(report);
        }
        return reports;
    }
}