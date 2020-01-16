/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";

import { getPageHeader } from "../entities/BaseEntity";
import { Hba1CService } from "../services/Hba1CService";
import { BaseController } from "./BaseController";

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
            .put("/:userUid/hba1c/:id",    this.jsonParser, this.updateUserHbA1C)
            .delete("/:userUid/hba1c/:id",                  this.deleteUserHbA1C);
    }

    private async getAllUserHbA1C(req: Request, res: Response) {
        const [hba1c, count] = await Hba1CService.getAllHba1C(req.params.userUid, req.query);
        const header = getPageHeader(await count, req.query);

        res.setHeader("X-Pages", header);
        res.send(hba1c);
    }

    private async addUserHbA1C(req: Request, res: Response) {
        res.send(await Hba1CService.addHba1C(req.params.userUid, req.body));
    }

    private async getUserHbA1C(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            hba1cId: parseInt(req.params.id, 10),
        };

        res.send(await Hba1CService.getHba1C(params));
    }

    private async updateUserHbA1C(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            hba1cId: parseInt(req.params.id, 10),
        };

        res.send(await Hba1CService.updateHba1C(params, req.body));
    }

    private async deleteUserHbA1C(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            hba1cId: parseInt(req.params.id, 10),
        };

        await Hba1CService.deleteHba1C(params);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
