/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Apr 17 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class UserPasswordReset extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user) => user.password_resets, { cascade: true })
    @JoinColumn()
    public user: Promise<User>;

    @Column({ type: "uuid", nullable: true })
    public code?: string | null;

    @Column({ default: () => "(now() + '1 day'::interval)" })
    public expires_at: Date;

    @Column({ default: false })
    public used: boolean = false;

    // Repository function

    public static async findByCode(code: string): Promise<UserPasswordReset | undefined> {
        const query = this
            .createQueryBuilder("password_reset")
            .where("password_reset.code = :code", { code })
            .andWhere("password_reset.expires_at > now()")
            .andWhere("password_reset.used = false");

        return query.getOne();
    }

}
