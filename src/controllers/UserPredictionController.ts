/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Mar 16 2020
*/

import { Body, Get, JsonController, Param, Put, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable, Timeable } from "../lib";
import { PredictionService } from "../services";
import { PredictionSettingsUpdateReq } from "../requests";
import { Response } from "express";

@JsonController("/v1/users/:uid/predictions")
export class UserPredictionController {

    @Get("/")
    @Authorized("biometrics:read")
    public async getPredictions(@Param("uid") uid: string,
                                @QueryParams() p: Pageable,
                                @QueryParams() t: Timeable,
                                @Res() res: Response) {
        const page = await PredictionService.getAllPredictions(uid, p, t);
        return page.send(res);
    }

    @Get("/predict")
    @Authorized("predictions:new")
    public async getNewPrediction(@Param("uid") uid: string) {
        return PredictionService.getNewPrediction(uid, false);
    }

    @Get("/settings")
    @Authorized("predictions:new")
    public async getPredictionSettings(@Param("uid") uid: string) {
        return PredictionService.getPredictionSettings(uid);
    }

    @Put("/settings")
    @Authorized("predictions:settings")
    public async updatePredictionSettings(@Param("uid") uid: string, @Body() req: PredictionSettingsUpdateReq) {
        return PredictionService.updatePredictionSettings(uid, req);
    }

}
