/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { IInsulinSearchRequest, Insulin, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";

import { BaseService } from "./BaseService";

interface ICreateInsulinRequest {
    timestamp: number;
    quantity: number;
    description: string;
}

interface IUpdateInsulinRequest {
    timestamp?: number;
    quantity?: number;
    description?: string;
}

export class InsulinService extends BaseService {

    public static async getAllInsulin(patientUid: string, p: Pageable): Promise<Page<Insulin>> {
        return Insulin.findAll(patientUid, p);
    }

    public static async getInsulin(params: IInsulinParams): Promise<Insulin> {
        const insulin = await Insulin.findById(params.userUid, params.insulinId);
        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin ${params.insulinId} not found`);
        }
        return insulin;
    }

    public static async addInsulin(patientUid: string, req: ICreateInsulinRequest): Promise<Insulin> {
        // Get the user
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        // Add Insulin
        const insulin = new Insulin();
        insulin.timestamp = req.timestamp;
        insulin.quantity = req.quantity;
        insulin.description = req.description;
        insulin.user = Promise.resolve(user);

        return insulin.save();
    }

    public static async updateInsulin(params: IInsulinParams, req: IUpdateInsulinRequest): Promise<Insulin> {
        const insulin = await Insulin.findById(params.userUid, params.insulinId);

        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin (${params.insulinId}) or User (${params.userUid}) not found`);
        }

        if (req.description !== undefined) { insulin.description = req.description; }
        if (req.quantity !== undefined) { insulin.quantity = req.quantity; }
        if (req.timestamp !== undefined) { insulin.timestamp = req.timestamp; }

        return insulin.save();
    }

    public static async deleteInsulin(params: IInsulinParams) {
        const insulin = await Insulin.findById(params.userUid, params.insulinId);

        if (insulin === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "insulin_not_found", `Insulin (${params.insulinId}) or User (${params.userUid}) not found`);
        }
        insulin.deleted = true;
        return insulin.save();
    }

}

interface IInsulinParams {
    userUid: string;
    insulinId: number;
}
