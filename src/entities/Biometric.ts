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
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

export enum SexEnum {
    FEMALE = "female",
    MALE = "male",
}

export enum DiabetesType {
    TYPE_1 = "1",
    TYPE_2 = "2",
}

@Entity()
export class Biometric extends BaseEntityHiddenId {
    @Column({
        type: "date",
        nullable: true,
    })
    public date_of_birth: Date | null;

    @Column({ type: "float", nullable: true })
    public mass: number | null;

    @Column({ type: "float", nullable: true })
    public height: number | null;

    @Column({
        type: "enum",
        enum: SexEnum,
        nullable: true,
    })
    public sex: SexEnum | null;

    @Column({
        type: "enum",
        enum: DiabetesType,
        nullable: true,
    })
    public diabetes_type: DiabetesType | null;

    @Column({ type: "float", nullable: true })
    public hypoglycemia: number | null;

    @Column({ type: "float", nullable: true })
    public hyperglycemia: number | null;

    @OneToOne((type) => User, (user) => user.biometric)
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    constructor() {
        super();
        this.date_of_birth = null;
        this.mass = null;
        this.height = null;
        this.sex = null;
        this.diabetes_type = null;
        this.hypoglycemia = null;
        this.hyperglycemia = null;
    }

    public verify() {
        this.verifyTarget();
    }

    private verifyTarget() {
        if (this.hypoglycemia === null || this.hyperglycemia === null) {
            return;
        }
        if (this.hyperglycemia <= this.hypoglycemia) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_blood_sugar_target", "Hyperglycemia threshold must be greater than hypoglycemia threshold");
        }
    }
}
