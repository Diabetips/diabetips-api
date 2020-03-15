/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from ".";
import { BaseEntityHiddenId } from "./BaseEntityHiddenId";

export enum SexEnum {
    FEMALE = "female",
    MALE = "male",
}

@Entity()
export class Biometric extends BaseEntityHiddenId {
    @Column({
        type: "date",
        name: "date_of_birth",
        nullable: true,
    })
    public dateOfBirth: Date | null;

    @Column({ type: "float", nullable: true })
    public weight: number | null;

    @Column({ type: "float", nullable: true })
    public height: number | null;

    @Column({
        type: "enum",
        enum: SexEnum,
        nullable: true,
    })
    public sex: SexEnum | null;

    @OneToOne((type) => User, (user) => user.biometric)
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    constructor() {
        super();
        this.dateOfBirth = null;
        this.weight = null;
        this.height = null;
        this.sex = null;
    }
}
