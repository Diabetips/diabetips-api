/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, SelectQueryBuilder } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { User, IUserQueryOptions } from "./User";

@Entity()
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ default: () => "now()" })
    public time: Date;

    @Column({ default: false })
    public read: boolean;

    @Column()
    public type: string;

    @Column({ type: "simple-json" })
    public data: any;

    @ManyToOne(() => User, (user) => user.notifications, { cascade: true })
    @JoinColumn()
    public target: Promise<User>;

    private static getBaseQuery(uid: string, options: IUserQueryOptions): SelectQueryBuilder<Notification> {
        let qb = this
            .createQueryBuilder("notification")
            .leftJoin("notification.target", "user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                options: IUserQueryOptions = {}):
                                Promise<Page<Notification>> {
        const qb = this
            .getBaseQuery(uid, options)
            .orderBy("notification.time", "DESC");

        return p.query(qb);
    }

    public static async findAllUnread(uid: string,
                                      options: IUserQueryOptions = {}):
                                      Promise<Notification[]> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("notification.read = false")
            .orderBy("notification.time", "DESC");

        return qb.getMany();
    }

    public static async findById(uid: string, notifId: string,
                                 options: IUserQueryOptions = {}):
                                 Promise<Notification | undefined> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("notification.id = :notifId", { notifId });

        return qb.getOne();
    }

}
