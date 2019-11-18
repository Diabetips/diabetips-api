/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Request, Response } from "express";

import { AuthAppService } from "../services";

import { BaseController } from "./BaseController";

export class AuthAppController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/apps",           this.getAllApps)
            .get("/apps/:appid",    this.getApp);
    }

    private async getAllApps(req: Request, res: Response) {
        res.send(await AuthAppService.getAllApps());
    }

    private async getApp(req: Request, res: Response) {
        res.send(await AuthAppService.getApp(req.params.appid));
    }

}
