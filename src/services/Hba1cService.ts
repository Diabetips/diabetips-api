/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Hba1c, IHba1cSearchRequest, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";

import { BaseService } from "./BaseService";

interface ICreateHba1cRequest {
    timestamp: number;
    value: number;
}

interface IUpdateHba1cRequest {
    timestamp?: number;
    value?: number;
}

export class Hba1cService extends BaseService {

    public static async getAllHba1c(patientUid: string, p: Pageable): Promise<Page<Hba1c>> {
        return Hba1c.findAll(patientUid, p);
    }

    public static async getHba1c(patientUid: string, hba1cId: number): Promise<Hba1c> {
        const hba1c = await Hba1c.findById(patientUid, hba1cId);
        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} not found`);
        }
        return hba1c;
    }

    public static async addHba1c(patientUid: string, req: ICreateHba1cRequest): Promise<Hba1c> {
        // Get the user
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${patientUid} not found`);
        }

        // Add Hba1c
        const hba1c = new Hba1c();
        hba1c.timestamp = req.timestamp;
        hba1c.value = req.value;
        hba1c.user = Promise.resolve(user);

        return hba1c.save();
    }

    public static async updateHba1c(patientUid: string, hba1cId: number, req: IUpdateHba1cRequest): Promise<Hba1c> {
        const hba1c = await Hba1c.findById(patientUid, hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} or user ${patientUid} not found`);
        }

        if (req.value !== undefined) { hba1c.value = req.value; }
        if (req.timestamp !== undefined) { hba1c.timestamp = req.timestamp; }

        return hba1c.save();
    }

    public static async deleteHba1c(patientUid: string, hba1cId: number) {
        const hba1c = await Hba1c.findById(patientUid, hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} or user ${patientUid} not found`);
        }
        hba1c.deleted = true;
        return hba1c.save();
    }
}
