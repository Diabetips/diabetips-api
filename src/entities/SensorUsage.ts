/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Sep 22 2020
*/

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Note, User } from ".";
import { Pageable, Timeable, Page, Utils } from "../lib";

@Entity()
export class SensorUsage extends BaseEntity {
    @Column()
    public time: Date;

    @ManyToOne(() => User, (user) => user.sensor_usage, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    public static async findAll(userUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<SensorUsage>> {
        let qb = this
            .createQueryBuilder("sensor_usage")
            .leftJoin("sensor_usage.user", "user")
            .andWhere("user.uid = :userUid", { userUid })
            .orderBy("sensor_usage.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("sensor_usage.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }

    public static async getCount(userUid: string,
                                 t: Timeable,
                                 options: IBaseQueryOptions = {}):
                                 Promise<number> {
        let qb = this
            .createQueryBuilder("sensor_usage")
            .leftJoin("sensor_usage.user", "user")
            .where("user.uid = :userUid", { userUid })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("sensor_usage.deleted = false");
        }
        return t.applyTimeRange(qb).getCount();
    }
}