/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Request, Response } from "express";
import { HttpStatus } from "../lib";
import { BaseController } from "./BaseController";

export class UserBloodSugarController extends BaseController {

    private static dummy = [
        {
            timestamp: 1581806120,
            value: 57.7,
        },
        {
            timestamp: 1581806180,
            value: 60.8,
        },
        {
            timestamp: 1581806240,
            value: 61.5,
        },
        {
            timestamp: 1581806300,
            value: 63.2,
        },
    ];

    private static singleDummy = {
        timestamp: 1581806300,
        value: 63.2,
    };

    constructor() {
        super();

        this.router
            .get("/:userUid/blood_sugar/",                        this.getAllUserBloodSugar)
            .post("/:userUid/blood_sugar/",      this.jsonParser, this.addUserBloodSugar)
            .get("/:userUid/blood_sugar/last",                    this.getLastUserBloodSugar)
            .put("/:userUid/blood_sugar/",       this.jsonParser, this.updateUserBloodSugar)
            .delete("/:userUid/blood_sugar/",                     this.deleteUserBloodSugar);
    }

    private async getAllUserBloodSugar(req: Request, res: Response) {
        res.send(UserBloodSugarController.dummy);
    }

    private async addUserBloodSugar(req: Request, res: Response) {
        res.send(UserBloodSugarController.dummy);
    }

    private async getLastUserBloodSugar(req: Request, res: Response) {
        res.send(UserBloodSugarController.singleDummy);
    }

    private async updateUserBloodSugar(req: Request, res: Response) {
        res.send(UserBloodSugarController.dummy);
    }

    private async deleteUserBloodSugar(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
        }

}
