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
export class Note extends BaseEntity {
    @Column()
    public timestamp: number;

    @Column({ length: 500 })
    public description: string;

    @ManyToOne((type) => User, (user) => user.note, { cascade: true })
    @JoinColumn({ name: "user_id" })
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
            .orderBy("note.timestamp", "DESC");

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