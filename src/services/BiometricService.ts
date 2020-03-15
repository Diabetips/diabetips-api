/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { Biometric } from "../entities";
import { BiometricUpdateReq } from "../requests";
import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class BiometricService extends BaseService {
    public static async getUserBiometric(uid: string): Promise<Biometric> {
        const user = await UserService.getUser(uid);
        let biometric = await user.biometric;

        if (biometric === undefined) {
            biometric = new Biometric();
            biometric.user = Promise.resolve(user);
        }

        return biometric;
    }

    public static async updateUserBiometric(uid: string, req: BiometricUpdateReq) {
        const biometric = await this.getUserBiometric(uid);

        if (req.date_of_birth !== undefined) { biometric.dateOfBirth = req.date_of_birth; }
        if (req.weight !== undefined) { biometric.weight = req.weight; }
        if (req.height !== undefined) { biometric.height = req.height; }
        if (req.sex !== undefined) { biometric.sex = req.sex; }

        return biometric.save();
    }
}
