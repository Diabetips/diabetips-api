/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import bodyParser = require("body-parser");
import { Request, Response } from "express";

import { RecipeController } from ".";
import { BaseController, HttpStatus } from "./BaseController";

export class UserController extends BaseController {

    private static tmpMeal = {
        id: 2,
        time: "some timestamp here",
        description: "some description",
        recipes: [
            RecipeController.tmpSalad,
            RecipeController.tmpSalad,
        ],
    };

    constructor() {
        super();

        this.router
            .get("/", this.getAllUsers)
            .post("/", this.jsonParser, this.registerUser)
            .get("/:uid", this.getUser)
            .put("/:uid", this.jsonParser, this.updateUser)
            .delete("/:uid", this.deleteUser)
            // Meal routes
            .get("/:uid/meals/", this.getUserMeals)
            .post("/:uid/meals/", this.addUserMeal)
            .get("/:uid/meals/:id", this.getUserMeal)
            .put("/:uid/meals/:id", this.updateUserMeal)
            .delete("/:uid/meals/:id", this.deleteUserMeal);
    }

    /***************
     * USER ROUTES *
     ***************/

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

    /***************
     * MEAL ROUTES *
     ***************/

    private getUserMeals(req: Request, res: Response) {
        res.send([
            UserController.tmpMeal,
            UserController.tmpMeal,
        ]);
    }

    private getUserMeal(req: Request, res: Response) {
        res.send(UserController.tmpMeal);
    }

    private addUserMeal(req: Request, res: Response) {
        res.send(UserController.tmpMeal);
    }

    private updateUserMeal(req: Request, res: Response) {
        res.send(UserController.tmpMeal);
    }

    private deleteUserMeal(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
