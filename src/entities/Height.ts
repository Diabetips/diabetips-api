/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Mar 15 2020
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from ".";
import { Page, Pageable, Timeable, Utils } from "../lib";
import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

@Entity()
export class Height extends BaseEntityHiddenId {
    @Column({ type: "float" })
    public height: number;

    @Column()
    public timestamp: number;

    @ManyToOne((type) => User, (user) => user.height_history, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Height>> {
        let qb = this
            .createQueryBuilder("height")
            .leftJoin("height.user", "user")
            .where("user.uid = :uid", { uid })
            .orderBy("height.timestamp", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("height.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }
}
