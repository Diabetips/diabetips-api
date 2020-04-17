/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Dec 16 2019
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class UserPicture extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne((type) => User, (user) => user.picture, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column({ type: "bytea" })
    public blob: Buffer;

}
