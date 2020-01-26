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
export class Hba1c extends BaseEntity {

    @Column({ type: "float" })
    public value: number;

    @Column()
    public timestamp: number;

    @ManyToOne((type) => User, (user) => user.meals, { cascade: true })
    @JoinColumn({ name: "user_id" })
    public user: Promise<User>;

    public static async findAll(patientUid: string, req: IHba1cSearchRequest = {}, options: IHba1cQueryOptions = {}):
                                Promise<[Hba1c[], number]> {
        let query = this
            .createQueryBuilder("hba1c")
            .leftJoin("hba1c.user", "user")
            .andWhere("user.uid = :patientUid", { patientUid });

        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0")
                         .andWhere("hba1c.deleted = 0");
        }

        query = getPageableQuery(query, req);

        return query.getManyAndCount();
    }

    public static async findById(patientUid: string, hba1cId: number,
                                 options: IHba1cQueryOptions = {}): Promise<Hba1c | undefined> {
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
export interface IHba1cQueryOptions extends IBaseQueryOptions {
}

// tslint:disable-next-line: no-empty-interface
export interface IHba1cSearchRequest extends IBaseSearchRequest {
}
