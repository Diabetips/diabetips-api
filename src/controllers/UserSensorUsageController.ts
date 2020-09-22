import { Response } from "express";
/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Sep 22 2020
*/

import { Authorized, Get, JsonController, Param, QueryParams, Res } from "routing-controllers";
import { Pageable, Timeable } from "../lib";
import { SensorUsageService } from "../services/SensorUsageService";

@JsonController("/v1/users/:uid/blood_sugar/usage")
export class UserSensorUsageController {

    @Get("/")
    @Authorized("biometrics:read")
    public async getSensorUsage(@Param("uid") uid: string,
                                @QueryParams() p: Pageable,
                                @QueryParams() t: Timeable,
                                @Res() res: Response) {
        const page = await SensorUsageService.getAllUses(uid, p, t);
        return page.send(res);
    }

    @Get("/count")
    @Authorized("biometrics:read")
    public async getSensorUsageCount(@Param("uid") uid: string,
                                     @QueryParams() t: Timeable) {
        return SensorUsageService.getUsesCount(uid, t);
    }
}