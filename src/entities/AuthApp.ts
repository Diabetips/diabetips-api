/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Column, Entity, OneToOne } from "typeorm";

import { BaseEntityHiddenId, IBaseQueryOptions, optionDefault } from "./BaseEntityHiddenId";

import { AuthAppLogo } from "./AuthAppLogo";
export { AuthAppLogo };

@Entity()
export class AuthApp extends BaseEntityHiddenId {

    @Column({ length: 36, unique: true })
    public appid: string;

    @Column({ length: 200 })
    public name: string;

    @Column({ name: "client_id", length: 36 })
    private _clientId: string;

    @Column({ name: "client_secret", length: 100 })
    private _clientSecret?: string;

    public get clientId(): string | undefined {
        return this._clientId;
    }

    public get clientSecret(): string | undefined {
        return this._clientSecret;
    }

    @OneToOne((type) => AuthAppLogo, (logo) => logo.app)
    public logo: Promise<AuthAppLogo>;

    // Repository functions

    public static async findAll(options: IBaseQueryOptions = {}): Promise<AuthApp[]> {
        let query = this
            .createQueryBuilder("auth_app")
            .select("auth_app");
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("auth_app.deleted = 0");
        }
        return query.getMany();
    }

    public static async findByAppid(appid: string, options: IBaseQueryOptions = {}): Promise<AuthApp | undefined> {
        let query = this
            .createQueryBuilder("auth_app")
            .select("auth_app")
            .where("auth_app.appid = :appid", { appid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("auth_app.deleted = 0");
        }
        return query.getOne();
    }

    public static async findByClientId(clientId: string, options: IBaseQueryOptions = {}):
        Promise<AuthApp | undefined> {
        let query = this
            .createQueryBuilder("auth_app")
            .select("auth_app")
            .where("auth_app.client_id = :clientId", { clientId });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("auth_app.deleted = 0");
        }
        return query.getOne();
    }

}
