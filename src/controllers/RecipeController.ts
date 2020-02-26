/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Pageable } from "../lib";
import { RecipeCreateReq, RecipeSearchReq, RecipeUpdateReq } from "../requests";
import { RecipeService } from "../services";

@JsonController("/v1/recipes")
export class RecipeController {

    @Get("/")
    private async getAllRecipes(@QueryParams() p: Pageable, @QueryParams() req: RecipeSearchReq, @Res() res: Response) {
        const page = await RecipeService.getAllRecipes(p, req);
        return page.send(res);
    }

    @Post("/")
    private async createRecipe(@Body() body: RecipeCreateReq) {
        return RecipeService.createRecipe(body);
    }

    @Get("/:id")
    private async getRecipe(@Param("id") id: number) {
        return RecipeService.getRecipe(id);
    }

    @Put("/:id")
    private async updateRecipe(@Param("id") id: number, @Body() body: RecipeUpdateReq) {
        return RecipeService.updateRecipe(id, body);
    }

    @Delete("/:id")
    private async deleteRecipe(@Param("id") id: number) {
        await RecipeService.deleteRecipe(id);
    }

}
