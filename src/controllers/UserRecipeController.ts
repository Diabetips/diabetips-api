/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Jul 27 2020
*/

import { JsonController, Get, Param, QueryParams, Res, Post, Delete } from "routing-controllers";
import { Pageable, Context } from "../lib";
import { Response } from "express";
import { RecipeService } from "../services";
import { RecipeSearchReq } from "../requests";

@JsonController("/v1/users/:uid/recipes")
export class UserRecipeController {
    @Get("")
    public async getUserRecipes(@Param("uid") uid: string,
                                @QueryParams() p: Pageable,
                                @QueryParams() s: RecipeSearchReq,
                                @Res() res: Response) {
        s.author = uid;
        const page = await RecipeService.getAllRecipes(p, s);
        return page.send(res);
    }

    @Get("/favorites")
    public async getFavoriteRecipes(@Param("uid") uid: string,
                                    @QueryParams() p: Pageable,
                                    @Res() res: Response) {
        return RecipeService.getFavoriteRecipes(uid, p);
    }

    @Post("/favorites/:id")
    public async addFavoriteRecipe(@Param("uid") uid: string,
                                   @Param("id") id: number) {
        await RecipeService.addFavoriteRecipe(uid, id);
    }

    @Delete("/favorites/:id")
    public async removeFavoriteRecipe(@Param("uid") uid: string,
                                      @Param("id") id: number) {
        await RecipeService.removeFavoriteRecipe(uid, id);
    }
}