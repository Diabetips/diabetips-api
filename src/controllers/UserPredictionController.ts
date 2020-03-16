/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Mar 16 2020
*/

import { Body, Get, JsonController, Param, Put } from "routing-controllers";

import { PredictionSettingsUpdateReq } from "../requests";

@JsonController("/v1/users/:uid/predictions")
export class UserPredictionController {

    @Get("/predict")
    public async getNewPrediction(@Param("uid") uid: string) {
        return {
            id: 1234567,
            time: new Date().toISOString(),
            insulin: 10.5,
            confidence: 0.69,
        };
    }

    @Get("/settings")
    public async getPredictionSettings(@Param("uid") uid: string) {
        return {
            enabled: true,
        };
    }

    @Put("/settings")
    public async putPredictionSettings(@Param("uid") uid: string, @Body() req: PredictionSettingsUpdateReq) {
        return {
            enabled: true,
        };
    }

}
