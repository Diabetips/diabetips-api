/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue May 19 2020
*/

import { AxiosResponse, default as axios } from "axios";

import { config } from "../config";
import { Insulin, Prediction, PredictionSettings } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { logger } from "../logger";
import { PredictionSettingsUpdateReq } from "../requests";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class PredictionService extends BaseService {

    public static async getAllPredictions(uid: string, p: Pageable, t: Timeable): Promise<Page<Prediction>> {
        return Prediction.findAll(uid, p, t);
    }

    public static async getPredictionComparison(uid: string, p: Pageable, t: Timeable): Promise<Page<Insulin>> {
        return Insulin.findAllAndCompare(uid, p, t);
    }

    public static async getNewPrediction(uid: string, isSimulation: boolean = true): Promise<Prediction> {
        const user = await UserService.getUser(uid);
        const settings = await user.prediction_settings || new PredictionSettings();

        if (!isSimulation && !settings.enabled) {
            throw new ApiError(HttpStatus.FORBIDDEN, "predictions_disabled", "Predictions are not enabled for this user");
        }

        let res: AxiosResponse;
        try {
            res = await axios.get(config.ai.url + `/models/${uid}/predict`);
        } catch (err) {
            if (err.response) {
                const { message } = err.response.data;
                logger.warn("AI error:", message);
                if (err.response.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
                    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "server_error", "AI server error");
                } else {
                    throw new ApiError(HttpStatus.BAD_REQUEST, "prediction_failed", message);
                }
            } else {
                logger.error("Failed to send request to AI:", err.stack ?? err);
                throw err;
            }
        }

        const prediction = new Prediction();
        prediction.user = Promise.resolve(user);
        prediction.insulin = res.data.result;
        prediction.confidence = -1;
        return prediction.save();
    }

    public static async getPredictionSettings(uid: string): Promise<PredictionSettings> {
        const user = await UserService.getUser(uid);
        return (await user.prediction_settings) || new PredictionSettings();
    }

    public static async updatePredictionSettings(uid: string, req: PredictionSettingsUpdateReq): Promise<PredictionSettings> {
        const user = await UserService.getUser(uid);

        let settings = await user.prediction_settings;
        if (settings == null) {
            settings = new PredictionSettings();
            settings.user = Promise.resolve(user);
        }

        if (req.enabled != null) { settings.enabled = req.enabled; }

        return settings.save();
    }
}
