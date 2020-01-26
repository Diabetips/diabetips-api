/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jan 19 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class UserConfirmation extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @OneToOne((type) => User, (user) => user.confirmation)
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    @Column({ type: "varchar", length: 36, unique: true, nullable: true })
    public code?: string | null;

    @Column({ default: false })
    public confirmed: boolean = false;

    // Repository function

    public static async findByCode(code: string): Promise<UserConfirmation | undefined> {
        const query = this
            .createQueryBuilder("confirmation")
            .andWhere("confirmation.code = :code", { code });
        return query.getOne();
    }

}
