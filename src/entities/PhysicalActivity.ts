/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Oct 18 2020
*/

import { Column, Entity, JoinColumn, ManyToOne, SelectQueryBuilder } from "typeorm";
import { Page, Pageable, Timeable, Utils } from "../lib";
import { BaseEntity } from "./BaseEntity";
import { IBaseQueryOptions } from "./BaseEntityHiddenId";
import { User } from "./User";

@Entity()
export class PhysicalActivity extends BaseEntity {

    @Column()
    public title: string;

    @Column()
    public description: string;

    @Column()
    public type: string;

    @Column()
    public intensity: number;

    @Column({ type: "float" })
    public calories: number;

    @Column()
    public start: Date;

    @Column()
    public end: Date;

    @ManyToOne(() => User, (user) => user.physical_activities, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    public static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<PhysicalActivity> {
        let qb = this
            .createQueryBuilder("activity")
            .leftJoin("activity.user", "user")
            .where("user.uid = :uid", { uid })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("activity.deleted = false");
        }
        return qb;
    }

    public static async findAllPageable(uid: string,
                                        p: Pageable,
                                        t: Timeable,
                                        options: IBaseQueryOptions = {}):
                                        Promise<Page<PhysicalActivity>> {
        let qb = this
            .getBaseQuery(uid, options)
            .orderBy("activity.start", "DESC");

        qb = t.applyTimeRange(qb, true);

        return p.query(qb);
    }

    public static async findById(uid: string,
                                 activityId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<PhysicalActivity | undefined> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("activity.id = :activityId", { activityId });

        return qb.getOne();
    }
}