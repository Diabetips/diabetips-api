/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Request, Response } from "express";

import { BaseController } from "./BaseController";

export class UserGlucoseController extends BaseController {

    public static glucoseSample = {
        timestamp: new Date().getTime(),
        glucose: [
          35,
          36,
          38,
          39.5,
          41,
          41,
          42,
        ],
    };

    constructor() {
        super();

        this.router
            .get("/:userUid/glucose/",                                this.getAllUserGlucose)
            .post("/:userUid/glucose/",              this.jsonParser, this.addUserGlucose)
            .get("/:userUid/glucose/:start/:end",                     this.getUserGlucoseRange)
            .delete("/:userUid/glucose/:start/:end",                  this.deleteUserGlucoseRange);
    }

    private async getAllUserGlucose(req: Request, res: Response) {
        res.send(UserGlucoseController.glucoseSample);
    }

    private async addUserGlucose(req: Request, res: Response) {
        res.send(UserGlucoseController.glucoseSample);
    }

    private async getUserGlucoseRange(req: Request, res: Response) {
        res.send(UserGlucoseController.glucoseSample);
    }

    private async deleteUserGlucoseRange(req: Request, res: Response) {
        //
    }

}
