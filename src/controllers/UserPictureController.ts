/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import bodyParser = require("body-parser");

import { Body, ContentType, Controller, Get, Param, Post, UseBefore } from "routing-controllers";

import { UserPictureService } from "../services";

@Controller("/v1/users/:uid/picture")
export class UserPictureController {

    private static rawParser = bodyParser.raw({
        limit: "5mb",
        type: (req) => true,
    });

    @Get("/")
    @ContentType("jpeg")
    public async getUserPicture(@Param("uid") uid: string) {
        return UserPictureService.getUserPicture(uid);
    }

    @Post("/")
    @UseBefore(UserPictureController.rawParser)
    public async setUserPicture(@Param("uid") uid: string, @Body() body: Buffer) {
        await UserPictureService.setUserPicture(uid, body);
    }

}
