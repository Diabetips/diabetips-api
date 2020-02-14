/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Request, Response } from "express";
import { BaseController } from "./BaseController";

export class UserMassController extends BaseController {

    private static data = {
        timestamp: 1581716078,
        mass: 175,
    };
    private static dummy = [
        UserMassController.data,
        UserMassController.data,
        UserMassController.data,
    ];

    constructor() {
        super();

        this.router
        .get("/:userUid/mass", this.getMassHistory);
    }

    private async getMassHistory(req: Request, res: Response) {
        res.send(UserMassController.dummy);
    }
}
