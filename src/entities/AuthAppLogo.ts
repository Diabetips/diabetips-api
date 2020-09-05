/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Jan 18 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { AuthApp } from "./AuthApp";

@Entity()
export class AuthAppLogo extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne(() => AuthApp, (app) => app.logo)
    @JoinColumn()
    public app: Promise<AuthApp>;

    @Column({ type: "bytea" })
    public blob: Buffer;

}
