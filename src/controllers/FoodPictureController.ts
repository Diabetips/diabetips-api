/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Jan 18 2020
*/

import { ContentType, Controller, Get, Param } from "routing-controllers";

import { FoodPictureService } from "../services";

@Controller("/v1/food/:id/picture")
export class FoodPictureController {

    @Get("/")
    @ContentType("jpeg")
    public async getFoodPicture(@Param("id") id: number) {
        return FoodPictureService.getFoodPicture(id);
    }

}
