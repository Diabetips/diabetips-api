/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Column, Entity, ManyToOne, JoinColumn, SelectQueryBuilder } from "typeorm";

import { Page, Pageable, Timeable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";
import { User } from ".";

@Entity()
export class Note extends BaseEntity {
    @Column()
    public time: Date;

    @Column({ length: 500 })
    public description: string;

    @ManyToOne(() => User, (user) => user.note, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    private static getBaseQuery(uid: string, options: IBaseQueryOptions): SelectQueryBuilder<Note> {
        let qb = this
            .createQueryBuilder("note")
            .leftJoin("note.user", "user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("note.deleted = false");
        }

        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Note>> {
        const qb = this
            .getBaseQuery(uid, options)
            .orderBy("note.time", "DESC");

        return p.query(t.applyTimeRange(qb));
    }

    public static async findById(uid: string,
                                 noteId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Note | undefined> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("note.id = :noteId", { noteId });

        return qb.getOne();
    }
}
