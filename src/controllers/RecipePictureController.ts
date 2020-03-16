/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import bodyParser = require("body-parser");
import sharp = require("sharp");

import { ContentType, Controller, Delete, Get, Param, Post, UseBefore } from "routing-controllers";

const DEFAULT_RECIPE_PICTURE = sharp("data/default_recipe_picture.svg").jpeg().toBuffer();

@Controller("/v1/recipe/:id/picture")
export class RecipePictureController {

    private static rawParser = bodyParser.raw({
        limit: "2mb",
        type: (req) => true,
    });

    @Get("/")
    @ContentType("jpeg")
    public async getRecipePicture(@Param("id") id: number) {
        return DEFAULT_RECIPE_PICTURE;
    }

    @Post("/")
    @UseBefore(RecipePictureController.rawParser)
    public async setRecipePicture(@Param("id") id: number) {
        return;
    }

    @Delete("/")
    public async removeRecipePicture(@Param("id") id: number) {
        return;
    }
}
