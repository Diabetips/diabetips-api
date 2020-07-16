/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jul 16 2020
*/

import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";

import { AuthUserApp } from "./AuthUserApp";

@Entity()
export class AuthRefreshToken extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({ default: false })
    public revoked: boolean;

    @Column({ type: "uuid" })
    public token: string;

    @Column({ type: "simple-array" })
    public scopes: string[];

    @JoinColumn()
    @ManyToOne((type) => AuthUserApp)
    public auth: AuthUserApp;

    // Repository functions

    public static async findByToken(token: string): Promise<AuthRefreshToken | undefined> {
        const query = this
            .createQueryBuilder("refresh_token")
            .leftJoin("refresh_token.auth", "auth")
            .leftJoinAndSelect("auth.user", "user")
            .leftJoinAndSelect("auth.app", "app")
            .where("refresh_token.token = :token", { token })
            .andWhere("refresh_token.revoked = false")
            .andWhere("user.deleted = false")
            .andWhere("app.deleted = false");

        return query.getOne();
    }

}
