/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Mar 16 2020
*/

import { Body, Get, JsonController, Param, Put } from "routing-controllers";

import { Authorized } from "../lib";
import { PredictionService } from "../services";
import { PredictionSettingsUpdateReq } from "../requests";

@JsonController("/v1/users/:uid/predictions")
export class UserPredictionController {

    @Get("/predict")
    @Authorized("user.predictions:new")
    public async getNewPrediction(@Param("uid") uid: string) {
        return PredictionService.getNewPrediction(uid);
    }

    @Get("/settings")
    @Authorized("user.predictions:new")
    public async getPredictionSettings(@Param("uid") uid: string) {
        return PredictionService.getPredictionSettings(uid);
    }

    @Put("/settings")
    @Authorized("user.predictions:settings")
    public async updatePredictionSettings(@Param("uid") uid: string, @Body() req: PredictionSettingsUpdateReq) {
        return PredictionService.updatePredictionSettings(uid, req);
    }

}
