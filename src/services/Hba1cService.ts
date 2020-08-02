/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Hba1c, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable } from "../lib";
import { Hba1cCreateReq, Hba1cUpdateReq } from "../requests";

import { BaseService } from "./BaseService";

export class Hba1cService extends BaseService {

    public static async getAllHba1c(uid: string, p: Pageable, t: Timeable): Promise<Page<Hba1c>> {
        return Hba1c.findAll(uid, p, t);
    }

    public static async getHba1c(uid: string, hba1cId: number): Promise<Hba1c> {
        const hba1c = await Hba1c.findById(uid, hba1cId);
        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} not found`);
        }
        return hba1c;
    }

    public static async addHba1c(uid: string, req: Hba1cCreateReq): Promise<Hba1c> {
        // Get the user
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${uid} not found`);
        }

        // Add Hba1c
        const hba1c = new Hba1c();
        hba1c.time = req.time;
        hba1c.value = req.value;
        hba1c.user = Promise.resolve(user);

        return hba1c.save();
    }

    public static async updateHba1c(uid: string, hba1cId: number, req: Hba1cUpdateReq): Promise<Hba1c> {
        const hba1c = await Hba1c.findById(uid, hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} or user ${uid} not found`);
        }

        if (req.value !== undefined) { hba1c.value = req.value; }
        if (req.time !== undefined) { hba1c.time = req.time; }

        return hba1c.save();
    }

    public static async deleteHba1c(uid: string, hba1cId: number) {
        const hba1c = await Hba1c.findById(uid, hba1cId);

        if (hba1c === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "hba1c_not_found", `Hba1c ${hba1cId} or user ${uid} not found`);
        }
        hba1c.deleted = true;
        await hba1c.save();
    }
}
