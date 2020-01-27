/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Nov 15 2019
*/

import { Request, Response } from "express";

import { HttpStatus, Page, Pageable } from "../lib";
import { Hba1cService } from "../services";

import { BaseController } from "./BaseController";

export class UserHba1cController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:uid/hba1c/",                        this.getAllUserHba1c)
            .post("/:uid/hba1c/",      this.jsonParser, this.addUserHba1c)
            .get("/:uid/hba1c/:id",                     this.getUserHba1c)
            .put("/:uid/hba1c/:id",    this.jsonParser, this.updateUserHba1c)
            .delete("/:uid/hba1c/:id",                  this.deleteUserHba1c);
    }

    private async getAllUserHba1c(req: Request, res: Response) {
        const page = await Hba1cService.getAllHba1c(req.params.uid, new Pageable(req.query));
        page.sendAs(res);
    }

    private async addUserHba1c(req: Request, res: Response) {
        res.send(await Hba1cService.addHba1c(req.params.uid, req.body));
    }

    private async getUserHba1c(req: Request, res: Response) {
        res.send(await Hba1cService.getHba1c(req.params.uid, parseInt(req.params.id, 10)));
    }

    private async updateUserHba1c(req: Request, res: Response) {
        res.send(await Hba1cService.updateHba1c(req.params.uid, parseInt(req.params.id, 10), req.body));
    }

    private async deleteUserHba1c(req: Request, res: Response) {
        await Hba1cService.deleteHba1c(req.params.uid, parseInt(req.params.id, 10));
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
