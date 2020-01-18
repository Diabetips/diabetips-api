
/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { User } from "../entities";
import { HbA1C, IHbA1CSearchRequest } from "../entities/HbA1C";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { BaseService } from "./BaseService";

interface ICreateHba1CRequest {
    timestamp: number;
    value: number;
}

interface IUpdateHba1CRequest {
    timestamp?: number;
    value?: number;
}

export class Hba1CService extends BaseService {
    public static async getAllHba1C(patientUid: string, query: IHbA1CSearchRequest):
                                    Promise<[HbA1C[], Promise<number>]> {
        return HbA1C.findAll(patientUid, query);
    }

    public static async getHba1C(params: IHba1CParams): Promise<HbA1C> {
        const hba1c = await HbA1C.findById(params.userUid, params.hba1cId);
        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1C ${params.hba1cId} not found`);
        }
        return hba1c;
    }

    public static async addHba1C(patientUid: string, req: ICreateHba1CRequest): Promise<HbA1C> {
        // Get the user
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        // Add Hba1C
        const hba1c = new HbA1C();
        hba1c.timestamp = req.timestamp;
        hba1c.value = req.value;
        hba1c.user = Promise.resolve(user);

        return hba1c.save();
    }

    public static async updateHba1C(params: IHba1CParams, req: IUpdateHba1CRequest): Promise<HbA1C> {
        const hba1c = await HbA1C.findById(params.userUid, params.hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1C (${params.hba1cId}) or User (${params.userUid}) not found`);
        }

        if (req.value !== undefined) { hba1c.value = req.value; }
        if (req.timestamp !== undefined) { hba1c.timestamp = req.timestamp; }

        return hba1c.save();
    }

    public static async deleteHba1C(params: IHba1CParams) {
        const hba1c = await HbA1C.findById(params.userUid, params.hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1C (${params.hba1cId}) or User (${params.userUid}) not found`);
        }
        hba1c.deleted = true;
        return hba1c.save();
    }
}

interface IHba1CParams {
    userUid: string;
    hba1cId: number;
}
