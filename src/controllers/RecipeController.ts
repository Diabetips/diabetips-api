/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Body, Ctx, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res } from "routing-controllers";

import { Authorized, Context, Pageable } from "../lib";
import { RecipeCreateReq, RecipeSearchReq, RecipeUpdateReq } from "../requests";
import { RecipeService } from "../services";

@JsonController("/v1/recipes")
export class RecipeController {

    @Get("/")
    @Authorized("recipe:read")
    public async getAllRecipes(@QueryParams() p: Pageable,
                               @QueryParams() s: RecipeSearchReq,
                               @Res() res: Response) {
        const page = await RecipeService.getAllRecipes(p, s);
        return page.send(res);
    }

    @Post("/")
    @Authorized("recipe:write")
    public async createRecipe(@Body() body: RecipeCreateReq, @Ctx() context: Context) {
        return RecipeService.createRecipe(body, context);
    }

    @Get("/:id")
    @Authorized("recipe:read")
    public async getRecipe(@Param("id") id: number) {
        return RecipeService.getRecipe(id);
    }

    @Put("/:id")
    @Authorized("recipe:write")
    public async updateRecipe(@Param("id") id: number, @Body() body: RecipeUpdateReq) {
        return RecipeService.updateRecipe(id, body);
    }

    @Delete("/:id")
    @Authorized("recipe:write")
    public async deleteRecipe(@Param("id") id: number) {
        await RecipeService.deleteRecipe(id);
    }

}
