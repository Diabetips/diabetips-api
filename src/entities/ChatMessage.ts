/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Brackets, SelectQueryBuilder } from "typeorm";

import { Page, Pageable } from "../lib";

import { ChatAttachment } from "./ChatAttachment";
import { User } from "./User";

@Entity()
export class ChatMessage extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: () => "now()" })
    time: Date;

    @ManyToOne(() => User)
    @JoinColumn()
    from: Promise<User>;

    @ManyToOne(() => User)
    @JoinColumn()
    to: Promise<User>;

    @Column()
    content: string;

    @Column({ default: false })
    edited: boolean;

    @OneToMany(() => ChatAttachment, (ca) => ca.message)
    attachments: ChatAttachment[];

    public static async findByUids(uid: string, uid2: string, p: Pageable): Promise<Page<ChatMessage>> {
        const subq = (sqb: SelectQueryBuilder<ChatMessage>) => {
            return sqb
                .select("message.id")
                .leftJoin("message.from", "from")
                .leftJoin("message.to", "to")
                .where(new Brackets((bqb) => {
                    return bqb
                        .where(new Brackets((sbqb) => {
                            return sbqb
                                .where("from.uid = :uid")
                                .andWhere("to.uid = :uid2");
                        }))
                        .orWhere(new Brackets((sbqb) => {
                            return sbqb
                                .where("from.uid = :uid2")
                                .andWhere("to.uid = :uid");
                        }));
                }))
                .setParameters({ uid, uid2 })
                .orderBy("message.time", "DESC");
        }

        const qb = this
            .createQueryBuilder("message")
            .leftJoinAndSelect("message.attachments", "attachment")
            .where((sqb) => "message.id IN " + p.limit(subq(sqb.subQuery().from(ChatMessage, "message"))).getQuery())
            .orderBy("message.time", "DESC");

        return p.queryWithCountQuery(qb, subq(this.createQueryBuilder("message")));
    }

    public static async findById(from: string, to: string, messageId: string): Promise<ChatMessage | undefined> {
        const qb = this
            .createQueryBuilder("message")
            .leftJoin("message.from", "from")
            .leftJoin("message.to", "to")
            .where("from.uid = :from", { from })
            .andWhere("to.uid = :to", { to })
            .andWhere("message.id = :id", { id: messageId });

        return qb.getOne();
    }
}
