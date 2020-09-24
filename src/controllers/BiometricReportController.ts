/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Aug 29 2020
*/

import { JsonController, Get, Param, QueryParams } from "routing-controllers";
import { PeriodMode } from "../lib";
import { TimeRangeReq } from "../requests";
import { BiometricReportCalcsReq } from "../requests/BiometricReportCalcsReq";
import { BiometricReportService } from "../services/BiometricReportService";

@JsonController("/v1/users/:uid/report")
export class BiometricReportController {

    @Get("/hourly")
    public async getHourlyReport(@Param("uid") uid: string,
                                 @QueryParams() t: TimeRangeReq,
                                 @QueryParams() req: BiometricReportCalcsReq) {
        req.data = Array.isArray(req.data) ? req.data : [req.data] || [ ];
        return BiometricReportService.getReport(uid, t, req, PeriodMode.HOURLY);
    }

    @Get("/daily")
    public async getDailyReport(@Param("uid") uid: string,
                                @QueryParams() t: TimeRangeReq,
                                @QueryParams() req: BiometricReportCalcsReq) {
        req.data = Array.isArray(req.data) ? req.data : [req.data] || [ ];
        return BiometricReportService.getReport(uid, t, req, PeriodMode.DAILY);
    }
}