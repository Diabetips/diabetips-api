/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ChatMessage } from "./ChatMessage";

@Entity()
export class ChatAttachment extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => ChatMessage, { onDelete: "CASCADE" })
    @JoinColumn()
    public message: ChatMessage;

    @Column()
    public filename: string;

    @Column({ type: "bytea" })
    public blob: Buffer;

}
