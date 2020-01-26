/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { HttpStatus } from "../lib";
import { RecipeService } from "../services";

import { getPageHeader } from "../entities/BaseEntity";
import { BaseController } from "./BaseController";

export class RecipeController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",                        this.getAllRecipes)
            .post("/",      this.jsonParser, this.createRecipe)
            .get("/:id",                     this.getRecipe)
            .put("/:id",    this.jsonParser, this.updateRecipe)
            .delete("/:id",                  this.deleteRecipe);
    }

    private async getAllRecipes(req: Request, res: Response) {
        const [recipes, count] = await RecipeService.getAllRecipes(req.query);
        const header = getPageHeader(count, req.query);

        res.setHeader("X-Pages", header);
        res.send(recipes);
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
