/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { FoodController } from ".";
import { RecipeService } from "../services/RecipeService";
import { BaseController, HttpStatus } from "./BaseController";

export class RecipeController extends BaseController {

    // TODO: remove that
    public static tmpSalad = {
        id: 0,
        name: "Salade de concombres",
        description: "hello this is a description",
        ingredients: [
            {
                ...FoodController.tmpCucumber,
                quantity: 150,
            },
            {
                ...FoodController.tmpCream,
                quantity: 200,
            },
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

    private async getAllRecipes(req: Request, res: Response) {
        // TODO: need pagination
        res.send(await RecipeService.getAllRecipes(req.query));
    }

    private async getRecipe(req: Request, res: Response) {
        res.send(await RecipeService.getRecipe(parseInt(req.params.id, 10)));
    }

    private async createRecipe(req: Request, res: Response) {
        res.send(await RecipeService.createRecipe(req.body));
    }

    private async updateRecipe(req: Request, res: Response) {
        res.send(await RecipeService.updateRecipe(parseInt(req.params.id, 10), req.body));
    }

    private async deleteRecipe(req: Request, res: Response) {
        await RecipeService.deleteRecipe(parseInt(req.params.id, 10));
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
