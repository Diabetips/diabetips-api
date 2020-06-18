/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jun 18 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

import { User } from "./User";

@Entity()
@Unique(["user", "token"])
export class NotificationFcmToken extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => User, (user) => user.prediction_history, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column({ length: 200 })
    public token: string;

}
