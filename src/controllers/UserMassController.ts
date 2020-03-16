/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Response } from "express";
import { Get, JsonController, Param, QueryParams, Res } from "routing-controllers";

import { Pageable, Timeable } from "../lib";
import { MassService } from "../services";

@JsonController("/v1/users/:uid/mass")
export class UserMassController {

    @Get("/")
    public async getMassHistory(@Param("uid") uid: string,
                                @QueryParams() p: Pageable,
                                @QueryParams() t: Timeable,
                                @Res() res: Response) {
        const page = await MassService.getMassHistory(uid, p, t);
        return page.send(res);
    }

}
