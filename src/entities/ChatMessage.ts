/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
    from: User;

    @ManyToOne(() => User)
    @JoinColumn()
    to: User;

    @Column()
    content: string;

    @OneToMany(() => ChatAttachment, (ca) => ca.message)
    attachments: ChatAttachment[];

}
