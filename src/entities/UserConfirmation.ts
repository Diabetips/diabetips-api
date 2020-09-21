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

    @OneToOne(() => User, (user) => user.confirmation)
    @JoinColumn()
    public user: Promise<User>;

    @Column({ type: "uuid", nullable: true })
    public code?: string | null;

    @Column({ default: false })
    public confirmed: boolean = false;

    // Repository function

    public static async findByCode(code: string): Promise<UserConfirmation | undefined> {
        const query = this
            .createQueryBuilder("confirmation")
            .where("confirmation.code = :code", { code });

        return query.getOne();
    }

}
