/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Brackets } from "typeorm";

import { ChatMessage } from "./ChatMessage";

@Entity()
export class ChatAttachment extends BaseEntity {

    @PrimaryGeneratedColumn({ name: "id" })
    public _id: number;

    @ManyToOne(() => ChatMessage, { onDelete: "CASCADE" })
    @JoinColumn()
    public message: ChatMessage;

    @Column()
    public filename: string;

    @Column({ type: "bytea", select: false })
    public blob: Buffer;

    @Column()
    public size: number;

    public static async findByName(uid: string, uid2: string, messageId: string, filename: string): Promise<ChatAttachment | undefined> {
        const qb = this
            .createQueryBuilder("attachment")
            .addSelect("attachment.blob")
            .leftJoin("attachment.message", "message")
            .leftJoin("message.to", "to")
            .leftJoin("message.from", "from")
            .where(new Brackets((bqb) => {
                return bqb
                    .where(new Brackets((sbqb) => {
                        return sbqb
                            .where("to.uid = :uid")
                            .andWhere("from.uid = :uid2");
                    }))
                    .orWhere(new Brackets((sbqb) => {
                        return sbqb
                            .where("to.uid = :uid2")
                            .andWhere("from.uid = :uid");
                    }));
            }))
            .setParameters({ uid, uid2 })
            .andWhere("message.id = :messageId", { messageId })
            .andWhere("attachment.filename = :filename", { filename });

        return qb.getOne();
    }
}
