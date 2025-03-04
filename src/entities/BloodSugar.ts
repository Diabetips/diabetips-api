/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { Column, Entity, JoinColumn, ManyToOne, SelectQueryBuilder, Unique } from "typeorm";

import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Timeable, Utils } from "../lib";
import { TimeRangeReq } from "../requests";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";
import { User } from "./User";

@Entity({ name: "blood_sugar" })
@Unique(["time", "user"])
export class BloodSugar extends BaseEntityHiddenId {

    @Column()
    public time: Date;

    @Column({type: "float"})
    public value: number;

    @ManyToOne(() => User, (user) => user.blood_sugar, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    private static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<BloodSugar> {
        let qb = this
            .createQueryBuilder("blood_sugar")
            .leftJoin("blood_sugar.user", "user")
            .where("user.uid = :uid", { uid })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("blood_sugar.deleted = false");
        }
        return qb;
    }

    public static async findAllPageable(uid: string,
                                        p: Pageable,
                                        t: Timeable,
                                        options: IBaseQueryOptions = {}):
                                        Promise<Page<BloodSugar>> {
        let qb = this
            .getBaseQuery(uid, options)
            .orderBy("blood_sugar.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("blood_sugar.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }

    public static async findAll(uid: string,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<BloodSugar[]> {
        let qb = this
            .getBaseQuery(uid, options)
            .orderBy("blood_sugar.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("blood_sugar.deleted = false");
        }

        return t.applyTimeRange(qb).getMany();
    }

    public static async findLast(uid: string,
                                 options: IBaseQueryOptions = {}):
                                 Promise<BloodSugar | undefined> {
        let qb = this
            .getBaseQuery(uid, options)
            .orderBy("blood_sugar.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("blood_sugar.deleted = false");
        }
        return qb.getOne();
    }

    public static async findByTime(uid: string,
                                   time: Date,
                                   options: IBaseQueryOptions = {}):
                                   Promise<BloodSugar | undefined> {
        let qb = this
            .getBaseQuery(uid, options)
            .andWhere("blood_sugar.time = :time", { time })

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("blood_sugar.deleted = false");
        }

        return qb.getOne();
    }

    public static async deleteAllRange(patientUid: string,
                                       range: TimeRangeReq,
                                       options: IBaseQueryOptions = {}) {
        const user = await User.findByUid(patientUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        const qb = this
            .createQueryBuilder("blood_sugar")
            .delete()
            .where("blood_sugar.user_id = :id", { id: user.id })
            .andWhere("blood_sugar.time BETWEEN :start AND :end", { start: range.start, end: range.end });

        qb.execute();
    }
}
