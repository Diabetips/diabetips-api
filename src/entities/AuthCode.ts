/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jul 09 2020
*/

import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { config } from "../config";

import { AuthRefreshToken } from "./AuthRefreshToken";
import { AuthUserApp } from "./AuthUserApp";

@Entity()
export class AuthCode extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: string;

    @Column({ default: () => `(now() + '${config.auth.code_ttl}'::interval)` })
    public expires_on: Date;

    @Column({ default: false })
    public used: boolean;

    @Column({ type: "uuid" })
    public code: string;

    @Column({ type: "simple-array" })
    public scopes: string[];

    @JoinColumn()
    @ManyToOne((type) => AuthUserApp)
    public auth: AuthUserApp;

    @JoinColumn()
    @OneToOne((type) => AuthRefreshToken)
    public refresh_token?: AuthRefreshToken;

    // Repository functions

    public static async findByCode(code: string): Promise<AuthCode | undefined> {
        const query = this
            .createQueryBuilder("auth_code")
            .leftJoinAndSelect("auth_code.auth", "auth")
            .leftJoinAndSelect("auth_code.refresh_token", "refresh_token")
            .leftJoinAndSelect("auth.user", "user")
            .leftJoinAndSelect("auth.app", "app")
            .where("auth_code.code = :code", { code })
            .andWhere("auth_code.expires_on > now()")
            .andWhere("auth.revoked = false")
            .andWhere("user.deleted = false")
            .andWhere("app.deleted = false");

        return query.getOne();
    }

}
