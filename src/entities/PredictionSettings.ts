/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue May 19 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class PredictionSettings extends BaseEntity {

    @PrimaryGeneratedColumn({ name: "id" })
    public _id: number;

    @OneToOne((type) => User, (user) => user.prediction_settings, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column()
    public enabled: boolean = false;

    public get id(): number {
        return this._id;
    }

}
