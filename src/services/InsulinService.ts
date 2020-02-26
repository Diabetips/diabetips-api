/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Insulin, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";
import { InsulinCreateReq, InsulinUpdateReq } from "../requests";

import { BaseService } from "./BaseService";

export class InsulinService extends BaseService {

    public static async getAllInsulin(uid: string, p: Pageable): Promise<Page<Insulin>> {
        return Insulin.findAll(uid, p);
    }

    public static async getInsulin(uid: string, insulinId: number): Promise<Insulin> {
        const insulin = await Insulin.findById(uid, insulinId);
        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin ${insulinId} not found`);
        }
        return insulin;
    }

    public static async addInsulin(uid: string, req: InsulinCreateReq): Promise<Insulin> {
        // Get the user
        const user = await User.findByUid(uid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${uid}) not found`);
        }

        // Add Insulin
        const insulin = new Insulin();
        insulin.timestamp = req.timestamp;
        insulin.quantity = req.quantity;
        insulin.description = req.description;
        insulin.type = req.type;
        insulin.user = Promise.resolve(user);

        return insulin.save();
    }

    public static async updateInsulin(uid: string, insulinId: number, req: InsulinUpdateReq): Promise<Insulin> {
        const insulin = await Insulin.findById(uid, insulinId);

        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin (${insulinId}) or User (${uid}) not found`);
        }

        if (req.description !== undefined) { insulin.description = req.description; }
        if (req.quantity !== undefined) { insulin.quantity = req.quantity; }
        if (req.timestamp !== undefined) { insulin.timestamp = req.timestamp; }
        if (req.type !== undefined) { insulin.type = req.type; }

        return insulin.save();
    }

    public static async deleteInsulin(uid: string, insulinId: number) {
        const insulin = await Insulin.findById(uid, insulinId);

        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin (${insulinId}) or User (${uid}) not found`);
        }
        insulin.deleted = true;
        return insulin.save();
    }

}
