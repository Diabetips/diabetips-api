/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Body, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res, Ctx } from "routing-controllers";

import { Pageable, Context } from "../lib";
import { RecipeCreateReq, RecipeSearchReq, RecipeUpdateReq } from "../requests";
import { RecipeService } from "../services";

@JsonController("/v1/recipes")
export class RecipeController {

    @Get("/")
    public async getAllRecipes(@QueryParams() p: Pageable,
                               @QueryParams() s: RecipeSearchReq,
                               @Res() res: Response) {
        const page = await RecipeService.getAllRecipes(p, s);
        return page.send(res);
    }

    @Post("/")
    public async createRecipe(@Body() body: RecipeCreateReq, @Ctx() context: Context) {
        return RecipeService.createRecipe(body, context);
    }

    @Get("/:id")
    public async getRecipe(@Param("id") id: number) {
        return RecipeService.getRecipe(id);
    }

    @Put("/:id")
    public async updateRecipe(@Param("id") id: number, @Body() body: RecipeUpdateReq) {
        return RecipeService.updateRecipe(id, body);
    }

    @Delete("/:id")
    public async deleteRecipe(@Param("id") id: number) {
        await RecipeService.deleteRecipe(id);
    }

}
