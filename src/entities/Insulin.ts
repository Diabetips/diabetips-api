/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Page, Pageable, Timeable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { User } from "./User";

export enum InsulinType {
    SLOW = "slow",
    FAST = "fast",
    VERY_FAST = "very_fast",
}

@Entity()
export class Insulin extends BaseEntity {

    @Column()
    public timestamp: number;

    @Column({ type: "float" })
    public quantity: number;

    @Column({
        type: "enum",
        enum: InsulinType,
    })
    public type: InsulinType;

    @Column()
    public description: string;

    @ManyToOne((type) => User, (user) => user.insulin, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    // Repository functions

    public static async findAll(patientUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Insulin>> {
        let qb = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .where("user.uid = :patientUid", { patientUid })
            .orderBy("insulin.timestamp", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("insulin.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }

    public static async findById(patientUid: string,
                                 insulinId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Insulin | undefined> {
        let qb = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .where("insulin.id = :insulinId", { insulinId })
            .andWhere("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("insulin.deleted = false");
        }

        return qb.getOne();
    }
}
