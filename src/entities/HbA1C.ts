/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity, ManyToOne } from "typeorm";
import { User } from ".";
import { BaseEntity, IBaseQueryOptions, IBaseSearchRequest, manualPagination, optionDefault } from "./BaseEntity";

@Entity()
export class HbA1C extends BaseEntity {
    @Column({ name: "value" })
    public value: number;

    @Column({ name: "timestamp" })
    public timestamp: number;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    public user: User;

    public static async findAll(patientUid: string, req: IHbA1CSearchRequest = {},
                                options: IHbA1CQueryOptions = {}): Promise<HbA1C[]> {
        let query = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                .andWhere("hba1c.deleted = 0");
        }

        return manualPagination(await query.getMany(), req);
    }

    public static async findById(patientUid: string, hba1cId: number,
                                 options: IHbA1CQueryOptions = {}): Promise<HbA1C | undefined> {
        let query = this
            .createQueryBuilder("hba1c")
            .andWhere("hba1c.id = :hba1cId", { hba1cId })
            .leftJoin("hba1c.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                .andWhere("hba1c.deleted = 0");
        }
        return query.getOne();
    }
}

// tslint:disable-next-line: no-empty-interface
export interface IHbA1CQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IHbA1CSearchRequest extends IBaseSearchRequest {
}
