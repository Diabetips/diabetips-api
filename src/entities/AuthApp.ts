/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

import { AuthAppLogo } from "./AuthAppLogo";
export { AuthAppLogo };

@Entity()
export class AuthApp extends BaseEntityHiddenId {

    @Column({ type: "uuid" })
    public appid: string;

    @Column({ length: 200 })
    public name: string;

    @Column({ name: "client_id", type: "uuid" })
    private _clientId: string;

    @Column({ name: "client_secret", length: 100 })
    private _clientSecret?: string;

    @OneToOne((type) => AuthAppLogo, (logo) => logo.app)
    public logo: Promise<AuthAppLogo>;

    public get clientId(): string | undefined {
        return this._clientId;
    }

    public get clientSecret(): string | undefined {
        return this._clientSecret;
    }

    // Repository functions

    public static async findAll(options: IBaseQueryOptions = {}): Promise<AuthApp[]> {
        let qb = this.createQueryBuilder("auth_app");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        return qb.getMany();
    }

    public static async findByAppid(appid: string, options: IBaseQueryOptions = {}): Promise<AuthApp | undefined> {
        let qb = this
            .createQueryBuilder("auth_app")
            .where("auth_app.appid = :appid", { appid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        return qb.getOne();
    }

    public static async findByClientId(clientId: string, options: IBaseQueryOptions = {}):
                                       Promise<AuthApp | undefined> {
        let qb = this
            .createQueryBuilder("auth_app")
            .where("auth_app.client_id = :clientId", { clientId });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("auth_app.deleted = false");
        }

        return qb.getOne();
    }

}
