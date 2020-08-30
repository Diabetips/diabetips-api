/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Aug 23 2020
*/

import { BaseEntity, Brackets, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User";

@Entity()
export class UserConnection extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (u) => u.connections)
    @JoinColumn()
    public source: User;

    @ManyToOne(() => User, (u) => u.reverseConnections, { nullable: true })
    @JoinColumn()
    public target: User;

    @Column({ type: "uuid", nullable: true })
    public invite: string | null;

    @Column({ default: false })
    public accepted: boolean;

    // Repository functions

    public static async findAllByUid(uid: string): Promise<UserConnection[]> {
        const qb = this
            .createQueryBuilder("conn")
            .leftJoinAndSelect("conn.source", "source")
            .leftJoinAndSelect("conn.target", "target")
            .where(new Brackets((bqb) => {
                return bqb
                    .where("source.uid = :uid")
                    .orWhere("target.uid = :uid");
            }))
            .andWhere("accepted = true")
            .setParameters({ uid });

        return qb.getMany();
    }

    public static async findByUids(uid: string, uid2: string): Promise<UserConnection | undefined> {
        const qb = this
            .createQueryBuilder("conn")
            .leftJoinAndSelect("conn.source", "source")
            .leftJoinAndSelect("conn.target", "target")
            .where(new Brackets((bqb) => {
                return bqb
                    .where(new Brackets((sbqb) => {
                        return sbqb
                            .where("source.uid = :uid")
                            .andWhere("target.uid = :uid2");
                    }))
                    .orWhere(new Brackets((sbqb) => {
                        return sbqb
                            .where("target.uid = :uid2")
                            .andWhere("source.uid = :uid");
                    }));
            }))
            .setParameters({ uid, uid2 });

        return qb.getOne();
    }

    public static async findByInvite(invite: string): Promise<UserConnection | undefined> {
        const qb = this
            .createQueryBuilder("conn")
            .where("invite = :invite", { invite });

        return qb.getOne();
    }

}
