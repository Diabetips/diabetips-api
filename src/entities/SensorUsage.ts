/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Sep 22 2020
*/

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, SelectQueryBuilder } from "typeorm";
import { Note, User } from ".";
import { Pageable, Timeable, Page, Utils } from "../lib";

@Entity()
export class SensorUsage extends BaseEntity {
    @Column()
    public time: Date;

    @ManyToOne(() => User, (user) => user.sensor_usage, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    private static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<SensorUsage> {
        let qb = this
            .createQueryBuilder("sensor_usage")
            .leftJoin("sensor_usage.user", "user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("sensor_usage.deleted = false");
        }

        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<SensorUsage>> {
        const qb = this
            .getBaseQuery(uid, options)
            .orderBy("sensor_usage.time", "DESC");

        return p.query(t.applyTimeRange(qb));
    }

    public static async getCount(uid: string,
                                 t: Timeable,
                                 options: IBaseQueryOptions = {}):
                                 Promise<number> {
        const qb = this.getBaseQuery(uid, options)

        return t.applyTimeRange(qb).getCount();
    }
}