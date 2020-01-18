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

    @OneToOne((type) => Food, (food) => food.picture)
    @JoinColumn({ name: "food_id" })
    public food: Promise<Food>;

    @Column()
    public blob: Buffer;

}
