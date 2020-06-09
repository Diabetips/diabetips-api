/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import bodyParser = require("body-parser");

import { Body, ContentType, Controller, Delete, Get, Param, Post, UseBefore } from "routing-controllers";

import { RecipePictureService } from "../services";

@Controller("/v1/recipes/:id/picture")
export class RecipePictureController {

    private static rawParser = bodyParser.raw({
        limit: "2mb",
        type: (req) => true,
    });

    @Get("/")
    @ContentType("jpeg")
    public async getRecipePicture(@Param("id") id: number) {
        return RecipePictureService.getRecipePicture(id);
    }

    @Post("/")
    @UseBefore(RecipePictureController.rawParser)
    public async setRecipePicture(@Param("id") id: number, @Body() body: Buffer) {
        await RecipePictureService.setRecipePicture(id, body);
    }

    @Delete("/")
    public async removeRecipePicture(@Param("id") id: number) {
        await RecipePictureService.removeRecipePicture(id);
    }
}
