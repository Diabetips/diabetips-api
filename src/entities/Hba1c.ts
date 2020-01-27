/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest } from "./BaseEntity";

import { User } from "./User";

@Entity()
export class Hba1c extends BaseEntity {

    @Column({ type: "float" })
    public value: number;

    @Column()
    public timestamp: number;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(patientUid: string,
                                p: Pageable,
                                options: IHba1cQueryOptions = {}):
                                Promise<Page<Hba1c>> {
        let qb = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .where("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0")
                         .andWhere("hba1c.deleted = 0");
        }

        return p.query(qb);
    }

    public static async findById(patientUid: string,
                                 hba1cId: number,
                                 options: IHba1cQueryOptions = {}):
                                 Promise<Hba1c | undefined> {
        let qb = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .where("hba1c.id = :hba1cId", { hba1cId })
            .andWhere("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0")
                         .andWhere("hba1c.deleted = 0");
        }

        return qb.getOne();
    }

}

// tslint:disable-next-line: no-empty-interface
export interface IHba1cQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IHba1cSearchRequest extends IBaseSearchRequest {
}
