/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Response } from "express";
import { Get, JsonController, Param, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable, Timeable } from "../lib";
import { HeightService } from "../services";

@JsonController("/v1/users/:uid/height")
export class UserHeightController {

    @Get("/")
    @Authorized("biometrics:read")
    public async getHeightHistory(@Param("uid") uid: string,
                                  @QueryParams() p: Pageable,
                                  @QueryParams() t: Timeable,
                                  @Res() res: Response) {
        const page = await HeightService.getHeightHistory(uid, p, t);
        return page.send(res);
    }

}
