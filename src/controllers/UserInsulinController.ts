/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { InsulinService } from "../services";

import { getPageHeader } from "../entities/BaseEntity";
import { BaseController } from "./BaseController";

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
        const [insulin, count] = await InsulinService.getAllInsulin(req.params.userUid, req.query);
        const header = getPageHeader(count, req.query);

        res.setHeader("X-Pages", header);
        res.send(insulin);
    }

    private async addUserInsulin(req: Request, res: Response) {
        res.send(await InsulinService.addInsulin(req.params.userUid, req.body));
    }

    private async getUserInsulin(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            insulinId: parseInt(req.params.id, 10),
        };
        res.send(await InsulinService.getInsulin(params));
    }

    private async updateUserInsulin(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            insulinId: parseInt(req.params.id, 10),
        };
        res.send(await InsulinService.updateInsulin(params, req.body));
    }

    private async deleteUserInsulin(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            insulinId: parseInt(req.params.id, 10),
        };

        await InsulinService.deleteInsulin(params);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
