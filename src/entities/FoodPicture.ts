/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Jan 18 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Food } from "./Food";

@Entity()
export class FoodPicture extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne(() => Food, (food) => food.picture)
    @JoinColumn()
    public food: Promise<Food>;

    @Column({ type: "bytea" })
    public blob: Buffer;

}
