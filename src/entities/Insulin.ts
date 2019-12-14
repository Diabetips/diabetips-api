/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Dec 14 2019
*/

import { Column, Entity,  ManyToOne } from "typeorm";
import { User } from ".";
import { BaseEntity, IBaseSearchRequest, manualPagination, optionDefault } from "./BaseEntity";
import { IBaseQueryOptions } from "./BaseEntityHiddenId";

@Entity()
export class Insulin extends BaseEntity {
    @Column({ name: "timestamp"})
    public timestamp: number;

    @Column({ name: "quantity" })
    public quantity: number;

    @Column({ name: "description" })
    public description: string;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    public user: User;

    public static async findAll(patientUid: string, req: IInsulinSearchRequest = {},
                                options: IInsulinQueryOptions = {}): Promise<Insulin[]> {
        let query = this
            .createQueryBuilder("insulin")
            .leftJoin("insulin.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                .andWhere("insulin.deleted = 0");
        }

        return manualPagination(await query.getMany(), req);
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
