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

    @Column()
    public secret: string;

    @Column({ type: "simple-array" })
    public scopes: string[];

    @JoinColumn()
    @ManyToOne((type) => AuthUserApp)
    public auth: AuthUserApp;

    public token?: string;

    // Repository functions

    public static async findById(id: string): Promise<AuthRefreshToken | undefined> {
        const query = this
            .createQueryBuilder("refresh_token")
            .leftJoinAndSelect("refresh_token.auth", "auth")
            .leftJoinAndSelect("auth.user", "user")
            .leftJoinAndSelect("auth.app", "app")
            .where("refresh_token.id = :id", { id })
            .andWhere("refresh_token.revoked = false")
            .andWhere("auth.revoked = false")
            .andWhere("user.deleted = false")
            .andWhere("app.deleted = false");

        return query.getOne();
    }

}
