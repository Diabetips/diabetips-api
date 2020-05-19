/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Column, ManyToOne, JoinColumn, Entity } from "typeorm";
import { User } from ".";
import { Pageable, Timeable, Page, Utils } from "../lib";
import { IBaseQueryOptions } from "./BaseEntityHiddenId";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Event extends BaseEntity {
    @Column()
    public start: number;

    @Column({ nullable: true })
    public end: number;

    @Column({ length: 500 })
    public description: string;

    @ManyToOne((type) => User, (user) => user.event, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(userUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Event>> {
        let qb = this
            .createQueryBuilder("event")
            .leftJoin("event.user", "user")
            .andWhere("user.uid = :userUid", { userUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("event.deleted = false");
    }

        return p.query(t.applyTimeRangeOverPeriod(qb));
    }
    public static async findById(userUid: string,
                                 eventId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Event | undefined> {
        let qb = this
            .createQueryBuilder("event")
            .leftJoin("event.user", "user")
            .where("event.id = :eventId", { eventId })
            .andWhere("user.uid = :userUid", { userUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("event.deleted = false");
        }

        return qb.getOne();
    }

    public isValid(): boolean {
        return this.end === null || this.end === undefined || this.start <= this.end;
    }
}