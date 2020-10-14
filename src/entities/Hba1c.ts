/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, JoinColumn, ManyToOne, SelectQueryBuilder } from "typeorm";

import { Page, Pageable, Timeable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { User } from "./User";

@Entity()
export class Hba1c extends BaseEntity {

    @Column({ type: "float" })
    public value: number;

    @Column()
    public time: Date;

    @ManyToOne(() => User, (user) => user.meals, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    private static getBaseQuery(patientUid: string, options: IBaseQueryOptions): SelectQueryBuilder<Hba1c> {
        let qb = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .where("user.uid = :patientUid", { patientUid })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("hba1c.deleted = false");
        }
        return qb;
    }

    public static async findAll(patientUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Hba1c>> {
        const qb = this
            .getBaseQuery(patientUid, options)
            .orderBy("hba1c.time", "DESC");

        return p.query(t.applyTimeRange(qb));
    }

    public static async findById(patientUid: string,
                                 hba1cId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Hba1c | undefined> {
        const qb = this
            .getBaseQuery(patientUid, options)
            .andWhere("hba1c.id = :hba1cId", { hba1cId });

        return qb.getOne();
    }

}
