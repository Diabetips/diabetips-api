/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Sep 19 2020
*/

import { Column, Entity, JoinColumn, ManyToOne, SelectQueryBuilder, Unique } from "typeorm";
import { User } from ".";
import { Utils } from "../lib";
import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

@Entity()
export class StickyNote extends BaseEntity {
    @Column()
    public title: string;

    @Column()
    public content: string;

    @Column()
    public color: string;

    @Column()
    public index: number;

    @ManyToOne(() => User, (user) => user.sticky_notes, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @ManyToOne(() => User, (user) => user.patient_sticky_notes, { cascade: true })
    @JoinColumn()
    public patient: Promise<User>;

    private static getBaseQuery(userUid: string, patientUid: string, options: IBaseQueryOptions): SelectQueryBuilder<StickyNote> {
        let qb = this
            .createQueryBuilder("sticky_note")
            .leftJoin("sticky_note.user", "user")
            .where("user.uid = :userUid", { userUid })
            .leftJoin("sticky_note.patient", "patient")
            .andWhere("patient.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
            .andWhere("user.deleted = false")
            .andWhere("sticky_note.deleted = false");
        }

        return qb;
    }

    public static async findAll(userUid: string,
                                patientUid: string,
                                options: IBaseQueryOptions = {}):
                                Promise<StickyNote[]> {
        const qb = this
            .getBaseQuery(userUid, patientUid, options)
            .orderBy("sticky_note.index", "ASC");

        return qb.getMany();
    }

    public static async findById(userUid: string,
                                 patientUid: string,
                                 noteId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<StickyNote | undefined> {
        const qb = this
            .getBaseQuery(userUid, patientUid, options)
            .andWhere("sticky_note.id = :noteId", { noteId });

        return qb.getOne();
    }

    public static async findMaxIndex(userUid: string,
                                     patientUid: string,
                                     options: IBaseQueryOptions = {}):
                                     Promise<any> {
        const qb = this
            .getBaseQuery(userUid, patientUid, options)
            .select("MAX(sticky_note.index)")
            .setOption("disable-global-order");

        return qb.getRawOne();
    }
}