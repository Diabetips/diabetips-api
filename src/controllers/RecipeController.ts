/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { FoodController } from ".";
import { BaseController, HttpStatus } from "./BaseController";

export class RecipeController extends BaseController {

    public static tmpSalad = {
        id: 0,
        name: "Salade de concombres",
        ingredients: [
            FoodController.tmpCucumber,
            FoodController.tmpCream,
        ],
    };

    constructor() {
        super();

        this.router
            .get("/", this.getAllRecipes)
            .post("/", this.jsonParser, this.createRecipe)
            .get("/:id", this.getRecipe)
            .put("/:id", this.jsonParser, this.updateRecipe)
            .delete("/:id", this.deleteRecipe);
    }

    private getAllRecipes(req: Request, res: Response) {
        // TODO: Do the logic
        // TODO: need pagination
        // TODO: Need to add search/filtering
        res.send([
            RecipeController.tmpSalad,
            RecipeController.tmpSalad,
        ]);
    }

    private getRecipe(req: Request, res: Response) {
        // TODO: Do the logic
        res.send(RecipeController.tmpSalad);
    }

    private createRecipe(req: Request, res: Response) {
        // TODO: Do the logic
        res.send(RecipeController.tmpSalad);
    }

    private updateRecipe(req: Request, res: Response) {
        // TODO: Do the logic
        res.send(RecipeController.tmpSalad);
    }

    private deleteRecipe(req: Request, res: Response) {
        // TODO: Do the logic
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
