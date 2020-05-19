/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue May 19 2020
*/

import { default as axios } from "axios";

import { config } from "../config";
import { Prediction, PredictionSettings } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { PredictionSettingsUpdateReq } from "../requests";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

const DEFAULT_PREDICTION_SETTINGS = {
    enabled: true,
};

export class PredictionService extends BaseService {

    public static async getNewPrediction(uid: string): Promise<Prediction> {
        const user = await UserService.getUser(uid);
        const settings = (await user.prediction_settings) || DEFAULT_PREDICTION_SETTINGS;
        if (!settings.enabled) {
            throw new ApiError(HttpStatus.FORBIDDEN, "prediction_unavailable", "Predictions are not enabled for user");
        }

        const res = await axios.get(config.ai.url + `/models/${uid}/predict`);

        const prediction = new Prediction();
        prediction.user = Promise.resolve(user);
        prediction.insulin = res.data.result;
        prediction.confidence = -1;
        return prediction.save();
    }

}
