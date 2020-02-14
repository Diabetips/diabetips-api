/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Request, Response } from "express";
import { BaseController } from "./BaseController";

export class UserHeightController extends BaseController {

    private static data = {
        timestamp: 1581716078,
        height: 175,
    };
    private static dummy = [
        UserHeightController.data,
        UserHeightController.data,
        UserHeightController.data,
    ];

    constructor() {
        super();

        this.router
        .get("/:userUid/height", this.getHeightHistory);
    }

    private async getHeightHistory(req: Request, res: Response) {
        res.send(UserHeightController.dummy);
    }
}
