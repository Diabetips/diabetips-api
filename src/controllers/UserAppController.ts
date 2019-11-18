/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { AuthAppService } from "../services";

import { BaseController } from "./BaseController";

export class UserAppController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:uid/apps",              this.getAllUserApps)
            .delete("/:uid/apps/:appid",    this.deauthorizeApp);
    }

    private async getAllUserApps(req: Request, res: Response) {
        res.send(await AuthAppService.getAllUserApps(req.params.uid));
    }

    private async deauthorizeApp(req: Request, res: Response) {
        res.send(await AuthAppService.deauthorizeUserApp(req.params.uid, req.params.appid));
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
