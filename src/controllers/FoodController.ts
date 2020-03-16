/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Response } from "express";
import { Get, JsonController, Param, QueryParams, Res } from "routing-controllers";

import { Pageable } from "../lib";
import { FoodSearchReq } from "../requests";
import { FoodService } from "../services";

@JsonController("/v1/food")
export class FoodController {

    @Get("/")
    public async getAllFood(@QueryParams() p: Pageable, @QueryParams() req: FoodSearchReq, @Res() res: Response) {
        const page = await FoodService.getAllFood(p, req);
        return page.send(res);
    }

    @Get("/:id")
    public async getFood(@Param("id") id: number) {
        return FoodService.getFood(id);
    }

}
