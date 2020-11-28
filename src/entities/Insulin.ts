/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, JoinColumn, ManyToOne, OneToOne, SelectQueryBuilder } from "typeorm";

import { Page, Pageable, Timeable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { User } from "./User";
import { InsulinSearchReq } from "../requests";
import { Prediction } from ".";

export enum InsulinType {
    SLOW = "slow",
    FAST = "fast",
    VERY_FAST = "very_fast",
}

@Entity()
export class Insulin extends BaseEntity {

    @Column()
    public time: Date;

    @Column({ type: "float" })
    public quantity: number;

    @Column({
        type: "enum",
        enum: InsulinType,
    })
    public type: InsulinType;

    @Column()
    public description: string;

    @ManyToOne(() => User, (user) => user.insulin, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @OneToOne(() => Prediction, (prediction) => prediction.injection)
    @JoinColumn({ name: "prediction_id" })
    public prediction: Prediction;

    // Repository functions

    public static getBaseQuery(patientUid: string, options: IBaseQueryOptions): SelectQueryBuilder<Insulin> {
        let qb = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .where("user.uid = :patientUid", { patientUid })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("insulin.deleted = false");
        }
        return qb;
    }

    public static async findAllPageable(patientUid: string,
                                        p: Pageable,
                                        t: Timeable,
                                        s: InsulinSearchReq,
                                        options: IBaseQueryOptions = {}):
                                        Promise<Page<Insulin>> {
        let qb = this.
            getBaseQuery(patientUid, options)
            .orderBy("insulin.time", "DESC");

        qb = s.apply(qb);
        qb = t.applyTimeRange(qb);

        return p.query(qb);
    }

    public static async findAll(patientUid: string,
                                t: Timeable,
                                s: InsulinSearchReq,
                                options: IBaseQueryOptions = {}):
                                Promise<Insulin[]> {
        let qb = this
            .getBaseQuery(patientUid, options)
            .orderBy("insulin.time", "DESC");

        qb = s.apply(qb);
        qb = t.applyTimeRange(qb);

        return qb.getMany();
    }

    public static async findById(patientUid: string,
                                 insulinId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Insulin | undefined> {
        const qb = this
            .getBaseQuery(patientUid, options)
            .andWhere("insulin.id = :insulinId", { insulinId });

        return qb.getOne();
    }

    public static async findAllAndCompare(uid: string,
                                          p: Pageable,
                                          t: Timeable,
                                          options: IBaseQueryOptions = {}):
                                          Promise<Page<Insulin>> {
        const qb = this
            .getBaseQuery(uid, options)
            .leftJoinAndSelect("insulin.prediction", "prediction");

        return p.query(t.applyTimeRange(qb));
    }
}
