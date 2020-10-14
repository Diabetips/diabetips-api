/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Column, ManyToOne, JoinColumn, Entity, SelectQueryBuilder } from "typeorm";
import { User } from ".";
import { Pageable, Timeable, Page, Utils } from "../lib";
import { IBaseQueryOptions } from "./BaseEntityHiddenId";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Event extends BaseEntity {
    @Column()
    public start: Date;

    @Column({ nullable: true })
    public end: Date;

    @Column({ length: 500 })
    public description: string;

    @ManyToOne(() => User, (user) => user.event, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    private static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<Event> {
        let qb = this
            .createQueryBuilder("event")
            .leftJoin("event.user", "user")
            .where("user.uid = :userUid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("event.deleted = false");
        }

        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Event>> {
        const qb = this
            .getBaseQuery(uid, options)
            .orderBy("event.start", "DESC");

        return p.query(t.applyTimeRange(qb, true));
    }
    public static async findById(uid: string,
                                 eventId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Event | undefined> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("event.id = :eventId", { eventId });


        return qb.getOne();
    }

    public isValid(): boolean {
        return this.end === null || this.end === undefined || this.start <= this.end;
    }
}
