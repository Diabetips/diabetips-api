/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Nov 14 2020
*/

import { Brackets, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, SelectQueryBuilder } from "typeorm";
import { Page, Pageable, Timeable, Utils } from "../lib";
import { BaseEntity } from "./BaseEntity";
import { IBaseQueryOptions } from "./BaseEntityHiddenId";
import { User } from "./User";

@Entity()
export class PlanningEvent extends BaseEntity {

    @Column()
    public title: string;

    @Column()
    public description: string;

    @Column()
    public start: Date;

    @Column()
    public end: Date;

    @ManyToOne(() => User, (user) => user.owned_events, { cascade: true })
    @JoinColumn()
    public owner: User;

    @ManyToMany(() => User, {cascade: true})
    @JoinTable({
        name: "planning_event_members",
    })
    public members: User[];

    private static getBaseQuery(userUid: string, options: IBaseQueryOptions): SelectQueryBuilder<PlanningEvent> {
        let qb = this
            .createQueryBuilder("planning_event")
            .leftJoinAndSelect("planning_event.owner", "owner")
            .leftJoinAndSelect("planning_event.members", "members")
            .where(new Brackets((sub) => {
                sub = sub.where("owner.uid = :userUid", { userUid })
                         .orWhere("members.uid = :userUid", { userUid })
                }))

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb
                .andWhere("owner.deleted = false")
                .andWhere("planning_event.deleted = false");
        }
        return qb;
    }

    public static async findAll(uid: string,
                                p: Pageable,
                                t: Timeable,
                                options: IBaseQueryOptions = {}):
                                Promise<Page<PlanningEvent>> {
        const qb = this
            .getBaseQuery(uid, options);
        return p.query(t.applyTimeRange(qb, true));
    }

    public static async findById(uid: string,
                                 eventId: number,
                                 options: IBaseQueryOptions = {}):
                                 Promise<PlanningEvent | undefined> {
        const qb = this
            .getBaseQuery(uid, options)
            .andWhere("planning_event.id = :eventId", { eventId });

        return qb.getOne();
    }

    public isValid(): boolean {
        return this.start <= this.end;
    }
}