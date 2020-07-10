/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Jul 10 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { AuthApp } from "./AuthApp";
import { User } from "./User";

@Entity()
export class AuthUserApp extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ type: "simple-array" })
    public scopes: string[]

    @ManyToOne((type) => User)
    @JoinColumn({ name: "user_id" })
    public user: User;

    @ManyToOne((type) => AuthApp)
    @JoinColumn({ name: "app_id" })
    public app: AuthApp;

    // Repository functions

    public static async findAllByUid(uid: string): Promise<AuthUserApp[]> {
        const qb = this
            .createQueryBuilder("user_app")
            .leftJoin("user_app.user", "user")
            .leftJoin("user_app.app", "app")
            .where("user.uid = :uid", { uid });

        return qb.getMany();
    }

    public static async findByUidAndAppid(uid: string, appid: string): Promise<AuthUserApp | undefined> {
        const qb = this
            .createQueryBuilder("user_app")
            .leftJoinAndSelect("user_app.app", "app")
            .leftJoin("user_app.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("app.appid = :appid", { appid });

        return qb.getOne();
    }

}
