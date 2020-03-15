/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Mar 15 2020
*/

import { Height, User } from "../entities";
import { Page, Pageable, Timeable } from "../lib";
import { BaseService } from "./BaseService";

export class HeightService extends BaseService {

    public static async getHeightHistory(uid: string, p: Pageable, t: Timeable): Promise<Page<Height>> {
        return Height.findAll(uid, p, t);
    }

    public static async addHeightToHistory(user: User, h: number) {
        const height = new Height();

        height.timestamp = Math.round((new Date()).getTime() / 1000);
        height.height = h;
        height.user = Promise.resolve(user);
        await height.save();
    }
}
