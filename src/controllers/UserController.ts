/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import bodyParser = require("body-parser");
import { Request, Response } from "express";

import { BaseController, HttpStatus } from "./BaseController";
import { UserMealController } from "./UserMealController";

export class UserController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/", this.getAllUsers)
            .post("/", this.jsonParser, this.registerUser)
            .get("/:uid", this.getUser)
            .put("/:uid", this.jsonParser, this.updateUser)
            .delete("/:uid", this.deleteUser);
    }

    private getAllUsers(req: Request, res: Response) {
        res.send([
            {
                uid: "00000000-0000-0000-0000-000000000000",
                email: "jane.doe@example.com",
                first_name: "Jane",
                last_name: "Doe",
            },
        ]);
    }

    private registerUser(req: Request, res: Response) {
        res.send({
            uid: "00000000-0000-0000-0000-000000000000",
            email: "jane.doe@example.com",
            first_name: "Jane",
            last_name: "Doe",
        });
    }

    private getUser(req: Request, res: Response) {
        res.send({
            uid: "00000000-0000-0000-0000-000000000000",
            email: "jane.doe@example.com",
            first_name: "Jane",
            last_name: "Doe",
        });
    }

    private updateUser(req: Request, res: Response) {
        res.send({
            uid: "00000000-0000-0000-0000-000000000000",
            email: "jane.doe@example.com",
            first_name: "Jane",
            last_name: "Doe",
        });
    }

    private deleteUser(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
