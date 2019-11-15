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
    path: "users/{userUid}/Insulin",
    name: "Insulin",
})
export class UserInsulinController extends BaseController {
    public static insulinSample = {
        timestamp: new Date().getTime(),
        quantity: 2.5,
    };

    constructor() {
        super();

        this.router
            .get("/:userUid/insulin/",                        this.getAllUserInsulin)
            .post("/:userUid/insulin/",      this.jsonParser, this.addUserInsulin)
            .get("/:userUid/insulin/:id",                     this.getUserInsulin)
            .put("/:userUid/insulin/:id",    this.jsonParser, this.updateUserInsulin)
            .delete("/:userUid/insulin/:id",                  this.deleteUserInsulin);
    }

    private async getAllUserInsulin(req: Request, res: Response) {
        res.send([UserInsulinController.insulinSample]);
    }

    private async addUserInsulin(req: Request, res: Response) {
        res.send(UserInsulinController.insulinSample);
    }

    private async getUserInsulin(req: Request, res: Response) {
        res.send(UserInsulinController.insulinSample);
    }

    private async updateUserInsulin(req: Request, res: Response) {
        res.send(UserInsulinController.insulinSample);
    }

    private async deleteUserInsulin(req: Request, res: Response) {
    }

}
