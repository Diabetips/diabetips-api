/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Jul 10 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from "typeorm";

import { AuthApp } from "./AuthApp";
import { AuthCode } from "./AuthCode";
import { AuthRefreshToken } from "./AuthRefreshToken";
import { User } from "./User";

@Entity()
export class AuthUserApp extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", { name: "id" })
    private _id: string;

    @Column({ name: "revoked", default: false })
    private _revoked: boolean;

    @Column({ default: () => "now()" })
    public date: Date;

    @Column({ type: "simple-array" })
    public scopes: string[]

    @ManyToOne((type) => User)
    @JoinColumn({ name: "user_id" })
    public user: User;

    @ManyToOne((type) => AuthApp)
    @JoinColumn({ name: "app_id" })
    public app: AuthApp;

    @OneToMany((type) => AuthCode, (code) => code.auth)
    public auth_codes: AuthCode[];

    @OneToMany((type) => AuthRefreshToken, (rt) => rt.auth)
    public refresh_tokens: AuthRefreshToken[];

    public get id(): string {
        return this._id;
    }

    public get revoked(): boolean {
        return this._revoked;
    }

    public set revoked(value: boolean) {
        this._revoked = value;
    }

    // Repository functions

    public static async findAllByUid(uid: string): Promise<AuthUserApp[]> {
        const qb = this
            .createQueryBuilder("user_app")
            .leftJoin("user_app.user", "user")
            .leftJoinAndSelect("user_app.app", "app")
            .where("user.uid = :uid", { uid })
            .andWhere("user_app.revoked = false");

        return qb.getMany();
    }

    public static async findByUidAndAppid(uid: string, appid: string): Promise<AuthUserApp | undefined> {
        const qb = this
            .createQueryBuilder("user_app")
            .leftJoinAndSelect("user_app.app", "app")
            .leftJoinAndSelect("user_app.auth_codes", "auth_code", "auth_code.used = false")
            .leftJoinAndSelect("user_app.refresh_tokens", "refresh_token", "refresh_token.revoked = false")
            .leftJoin("user_app.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("app.appid = :appid", { appid })
            .andWhere("user_app.revoked = false");

        return qb.getOne();
    }

}
