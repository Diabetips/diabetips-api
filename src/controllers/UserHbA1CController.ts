/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Request, Response } from "express";
import { ApiPath } from "swagger-express-ts";
import { BaseController } from "./BaseController";

@ApiPath({
    path: "users/{userUid}/hba1c",
    name: "HbA1C",
})
export class UserHbA1CController extends BaseController {

    public static hba1cSample = {
        timestamp: new Date().getTime(),
        hba1c: 29,
    };

    constructor() {
        super();

        this.router
            .get("/:userUid/hba1c/",                        this.getAllUserHbA1C)
            .post("/:userUid/hba1c/",      this.jsonParser, this.addUserHbA1C)
            .get("/:userUid/hba1c/:id",                     this.getUserHbA1C)
            .post("/:userUid/hba1c/:id",   this.jsonParser, this.updateUserHbA1C)
            .delete("/:userUid/hba1c/:id",                  this.deleteUserHbA1C);
    }

    private async getAllUserHbA1C(req: Request, res: Response) {
        res.send([UserHbA1CController.hba1cSample]);
    }

    private async addUserHbA1C(req: Request, res: Response) {
        res.send(UserHbA1CController.hba1cSample);
    }

    private async getUserHbA1C(req: Request, res: Response) {
        res.send(UserHbA1CController.hba1cSample);
    }

    private async updateUserHbA1C(req: Request, res: Response) {
        res.send(UserHbA1CController.hba1cSample);
    }

    private async deleteUserHbA1C(req: Request, res: Response) {
    }

}
