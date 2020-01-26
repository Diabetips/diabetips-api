/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity, getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";

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

    public static async findAll(patientUid: string, req: IInsulinSearchRequest = {},
                                options: IInsulinQueryOptions = {}): Promise<[Insulin[], number]> {
        let query = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                         .andWhere("insulin.deleted = 0");
        }

        query = getPageableQuery(query, req);

        return query.getManyAndCount();
    }

    public static async findById(patientUid: string, insulinId: number,
                                 options: IInsulinQueryOptions = {}): Promise<Insulin | undefined> {
        let query = this
            .createQueryBuilder("insulin")
            .andWhere("insulin.id = :insulinId", { insulinId })
            .leftJoin("insulin.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                         .andWhere("insulin.deleted = 0");
        }
        return query.getOne();
    }
}

// tslint:disable-next-line: no-empty-interface
export interface IInsulinQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IInsulinSearchRequest extends IBaseSearchRequest {
}
