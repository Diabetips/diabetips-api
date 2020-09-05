/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Apr 16 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Recipe } from "./Recipe";

@Entity()
export class RecipePicture extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne(() => Recipe, (recipe) => recipe.picture, { cascade: true })
    @JoinColumn()
    public recipe: Promise<Recipe>;

    @Column({ type: "bytea" })
    public blob: Buffer;

}
