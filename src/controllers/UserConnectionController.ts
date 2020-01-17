/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 13 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { UserConnectionService } from "../services";

import { BaseController } from "./BaseController";

export class UserConnectionController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:uid/connections",                                this.getAllConnections)
            .post("/:uid/connections",              this.jsonParser, this.createConnection)
            .delete("/:uid/connections/:conn_uid",                   this.deleteConnection);
    }

    private async getAllConnections(req: Request, res: Response) {
        res.send(await UserConnectionService.getAllUserConnections(req.params.uid));
    }

    private async createConnection(req: Request, res: Response) {
        await UserConnectionService.createUserConnection(req.params.uid, req.body);
        res
            .status(HttpStatus.ACCEPTED)
            .send();
    }

    private async deleteConnection(req: Request, res: Response) {
        await UserConnectionService.deleteUserConnection(req.params.uid, req.params.conn_uid);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
