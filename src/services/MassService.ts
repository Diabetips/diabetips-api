/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Mar 15 2020
*/

import { Mass, User } from "../entities";
import { Page, Pageable, Timeable } from "../lib";
import { BaseService } from "./BaseService";

export class MassService extends BaseService {

    public static async getMassHistory(uid: string, p: Pageable, t: Timeable): Promise<Page<Mass>> {
        return Mass.findAll(uid, p, t);
    }

    public static async addMassToHistory(user: User, h: number) {
        const mass = new Mass();

        mass.timestamp = Math.round((new Date()).getTime() / 1000);
        mass.mass = h;
        mass.user = Promise.resolve(user);
        await mass.save();
    }
}
