/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { MassService } from ".";
import { Biometric } from "../entities";
import { BiometricUpdateReq } from "../requests";
import { BaseService } from "./BaseService";
import { HeightService } from "./HeightService";
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
        const user = await biometric.user;

        if (req.date_of_birth !== undefined) { biometric.date_of_birth = req.date_of_birth; }
        if (req.sex !== undefined) { biometric.sex = req.sex; }
        if (req.diabetes_type !== undefined) { biometric.diabetes_type = req.diabetes_type; }
        if (req.mass !== undefined) {
            biometric.mass = req.mass;
            MassService.addMassToHistory(user, req.mass);
        }
        if (req.height !== undefined) {
            biometric.height = req.height;
            HeightService.addHeightToHistory(user, req.height);
        }

        return biometric.save();
    }
}
