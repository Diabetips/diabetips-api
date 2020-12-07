/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Jul 10 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, SelectQueryBuilder } from "typeorm";

import { AuthScope, Utils } from "../lib";
import { UserAppsSearchReq } from "../requests";

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
    public scopes: AuthScope[]

    @ManyToOne(() => User)
    @JoinColumn()
    public user: User;

    @ManyToOne(() => AuthApp)
    @JoinColumn()
    public app: AuthApp;

    @OneToMany(() => AuthCode, (code) => code.auth)
    public auth_codes: AuthCode[];

    @OneToMany(() => AuthRefreshToken, (rt) => rt.auth)
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

    public static getBaseQuery(uid: string): SelectQueryBuilder<AuthUserApp> {
        return this
            .createQueryBuilder("user_app")
            .leftJoinAndSelect("user_app.app", "app")
            .leftJoin("user_app.user", "user")
            .where("user.uid = :uid", { uid })
            .andWhere("user_app.revoked = false");
    }

    public static async findAllByUid(uid: string, req: UserAppsSearchReq): Promise<AuthUserApp[]> {
        let qb = this
            .getBaseQuery(uid)
            .orderBy("user_app.date", "DESC");

        if (!Utils.optionDefault(req.internal, false)) {
            qb = qb.andWhere("internal = false");
        }

        return qb.getMany();
    }

    public static async findByUidAndAppid(uid: string, appid: string, options: IAuthUserAppQueryOptions = {}): Promise<AuthUserApp | undefined> {
        let qb = this
            .getBaseQuery(uid)
            .andWhere("app.appid = :appid", { appid });

        if (Utils.optionDefault(options.selectAuthCodesAndRefreshTokens, false)) {
            qb = qb
                .leftJoinAndSelect("user_app.auth_codes", "auth_code", "auth_code.used = false")
                .leftJoinAndSelect("user_app.refresh_tokens", "refresh_token", "refresh_token.revoked = false");
        }

        return qb.getOne();
    }

}

export interface IAuthUserAppQueryOptions {
    selectAuthCodesAndRefreshTokens?: boolean;
}
