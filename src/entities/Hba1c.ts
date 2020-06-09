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

@Entity()
export class Hba1c extends BaseEntity {

    @Column({ type: "float" })
    public value: number;

    @Column()
    public timestamp: number;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(patientUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Hba1c>> {
        let qb = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .where("user.uid = :patientUid", { patientUid })
            .orderBy("hba1c.timestamp", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("hba1c.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }

    public static async findById(patientUid: string,
                                 hba1cId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Hba1c | undefined> {
        let qb = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .where("hba1c.id = :hba1cId", { hba1cId })
            .andWhere("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("hba1c.deleted = false");
        }

        return qb.getOne();
    }

}
