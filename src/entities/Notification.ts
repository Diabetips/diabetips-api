/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { User, IUserQueryOptions } from "./User";

@Entity()
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public time: Date;

    @Column({ default: true })
    public read: boolean;

    @Column()
    public type: string;

    @Column({ type: "text", transformer: { from: JSON.parse, to: JSON.stringify } })
    public data: any;

    @ManyToOne((type) => User, (user) => user.notifications, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(uid: string,
                                p: Pageable,
                                options: IUserQueryOptions = {}):
                                Promise<Page<Notification>> {
        let qb = this
            .createQueryBuilder("notification")
            .leftJoin("notification.user", "user")
            .where("user.uid = :uid", { uid })
            .orderBy("notification.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return p.query(qb);
    }

    public static async findAllUnread(uid: string,
                                      options: IUserQueryOptions = {}):
                                      Promise<Notification[]> {
        let qb = this
            .createQueryBuilder("notification")
            .leftJoin("notification.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("notification.read = false")
            .orderBy("notification.time", "DESC");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return qb.getMany();
    }

    public static async findById(uid: string, notifId: string,
                                 options: IUserQueryOptions = {}):
                                 Promise<Notification | undefined> {
        let qb = this
            .createQueryBuilder("notification")
            .leftJoin("notification.user", "user")
            .where("notification.id = :notifId", { notifId })
            .andWhere("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false")
        }

        return qb.getOne();
    }

}
