/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import { NextFunction, Request, Response } from "express";

import { HttpStatus } from "../lib";
import { UserService } from "../services";

import { BaseController } from "./BaseController";

export class UserController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",                          this.getAllUsers)
            .post("/",        this.jsonParser, this.registerUser)
            .all(/\/me(\/.*)?/,                this.asCurrentUser)
            .get("/:uid",                      this.getUser)
            .put("/:uid",     this.jsonParser, this.updateUser)
            .delete("/:uid",                   this.deleteUser);
    }

    private asCurrentUser(req: Request, res: Response, next: NextFunction) {
        req.url = "/" + UserService.getCurrentUser(req.context).uid + req.url.slice(3);
        next("route");
    }

    private async getAllUsers(req: Request, res: Response) {
        res.send(await UserService.getAllUsers());
    }

    private async registerUser(req: Request, res: Response) {
        res.send(await UserService.registerUser(req.body));
    }

    private async getUser(req: Request, res: Response) {
        res.send(await UserService.getUser(req.params.uid));
    }

    private async updateUser(req: Request, res: Response) {
        res.send(await UserService.updateUser(req.params.uid, req.body));
    }

    private async deleteUser(req: Request, res: Response) {
        await UserService.deleteUser(req.params.uid);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
