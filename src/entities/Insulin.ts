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
export class Insulin extends BaseEntity {

    @Column()
    public timestamp: number;

    @Column({ type: "float" })
    public quantity: number;

    @Column()
    public description: string;

    @ManyToOne((type) => User, (user) => user.insulin, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    // Repository functions

    public static async findAll(patientUid: string,
                                p: Pageable,
                                req: IInsulinSearchRequest = {},
                                options: IInsulinQueryOptions = {}):
                                Promise<Page<Insulin>> {
        let qb = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .where("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0")
                         .andWhere("insulin.deleted = 0");
        }

        return p.query(qb);
    }

    public static async findById(patientUid: string,
                                 insulinId: number,
                                 options: IInsulinQueryOptions = {}):
                                 Promise<Insulin | undefined> {
        let qb = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .where("insulin.id = :insulinId", { insulinId })
            .andWhere("user.uid = :patientUid", { patientUid });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0")
                         .andWhere("insulin.deleted = 0");
        }

        return qb.getOne();
    }
}

// tslint:disable-next-line: no-empty-interface
export interface IInsulinQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IInsulinSearchRequest extends IBaseSearchRequest {
}
