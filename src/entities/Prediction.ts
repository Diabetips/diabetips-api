/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue May 19 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class Prediction extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user) => user.prediction_history, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @Column({ default: () => "now()" })
    public time: Date;

    @Column()
    public insulin: number;

    @Column()
    public confidence: number;

}
