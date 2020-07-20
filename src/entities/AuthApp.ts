/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { AuthScope, Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

import { AuthAppLogo } from "./AuthAppLogo";
export { AuthAppLogo };

@Entity()
export class AuthApp extends BaseEntityHiddenId {

    @Column({ type: "uuid" })
    public appid: string;

    @Column({ length: 200 })
    public name: string;

    @Column()
    public description: string;

    @Column({ default: false, select: false })
    public internal: boolean;

    @Column({ name: "redirect_uri", select: false })
    public _redirect_uri: string;

    @Column({ name: "client_id", length: 100, select: false })
    private _clientId: string;

    @Column({ name: "client_secret", length: 100, select: false })
    private _clientSecret?: string;

    @Column({ name: "extra_scopes", type: "simple-array", default: ""})
    public _extra_scopes: AuthScope[];

    @OneToOne((type) => AuthAppLogo, (logo) => logo.app)
    public logo: Promise<AuthAppLogo>;

    public get redirectUri(): string {
        return this._redirect_uri;
    }

    public get clientId(): string {
        return this._clientId;
    }

    public get clientSecret(): string | undefined {
        return this._clientSecret;
    }

    public set clientSecret(val: string | undefined) {
        this._clientSecret = val;
    }

    public get extra_scopes(): AuthScope[] {
        return this._extra_scopes;
    }

    // Repository functions

    public static async findAll(options: IBaseQueryOptions = {}): Promise<AuthApp[]> {
        let qb = this.createQueryBuilder("auth_app");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        return qb.getMany();
    }

    public static async findByAppid(appid: string, options: IAuthAppQueryOptions = {}): Promise<AuthApp | undefined> {
        let qb = this
            .createQueryBuilder("auth_app")
            .where("auth_app.appid = :appid", { appid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        if (Utils.optionDefault(options.selectClientCredentials, false)) {
            qb = qb
                .addSelect("auth_app.redirect_uri", "auth_app_redirect_uri")
                .addSelect("auth_app.client_id", "auth_app_client_id")
                .addSelect("auth_app.client_secret", "auth_app_client_secret");
        }

        return qb.getOne();
    }

    public static async findByClientId(clientId: string, options: IAuthAppQueryOptions = {}):
                                       Promise<AuthApp | undefined> {
        let qb = this
            .createQueryBuilder("auth_app")
            .where("auth_app.client_id = :clientId", { clientId });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        if (Utils.optionDefault(options.selectInternal, false)) {
            qb = qb.addSelect("auth_app.internal", "auth_app_internal");
        }

        if (Utils.optionDefault(options.selectClientCredentials, false)) {
            qb = qb
                .addSelect("auth_app.redirect_uri", "auth_app_redirect_uri")
                .addSelect("auth_app.client_id", "auth_app_client_id")
                .addSelect("auth_app.client_secret", "auth_app_client_secret");
        }

        return qb.getOne();
    }

}

export interface IAuthAppQueryOptions extends IBaseQueryOptions {
    selectInternal?: boolean;
    selectClientCredentials?: boolean;
}
