/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

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

    public static async findAll(userUid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Note>> {
        let qb = this
            .createQueryBuilder("note")
            .leftJoin("note.user", "user")
            .where("user.uid = :userUid", { userUid })
            .orderBy("note.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("note.deleted = false");
        }

        return p.query(t.applyTimeRange(qb));
    }

    public static async findById(userUid: string,
                                 noteId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<Note | undefined> {
        let qb = this
            .createQueryBuilder("note")
            .leftJoin("note.user", "user")
            .where("note.id = :noteId", { noteId })
            .andWhere("user.uid = :userUid", { userUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("user.deleted = false")
                .andWhere("note.deleted = false");
        }

        return qb.getOne();
    }
}
