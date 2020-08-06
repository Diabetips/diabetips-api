/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Jul 27 2020
*/

import { JsonController, Get, Param, QueryParams, Res, Ctx } from "routing-controllers";
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
}