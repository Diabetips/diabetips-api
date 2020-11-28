/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue May 19 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, SelectQueryBuilder } from "typeorm";
import { Page, Pageable, Timeable, Utils } from "../lib";
import { IBaseQueryOptions } from "./BaseEntity";

import { User } from "./User";

@Entity()
export class Prediction extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user) => user.prediction_history, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @Column({ default: () => "now()" })
    public time: Date;

    @Column()
    public insulin: number;

    @Column()
    public confidence: number;

    private static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<Prediction> {
        let qb = this
            .createQueryBuilder("prediction")
            .leftJoin("prediction.user", "user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
        }

        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Prediction>> {
        const qb = this
            .getBaseQuery(uid, options)

        return p.query(t.applyTimeRange(qb));
    }
}
