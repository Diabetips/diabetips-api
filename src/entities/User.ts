/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { Column, Entity } from "typeorm";

import { BaseEntity, IBaseQueryOptions, optionDefault } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {

    public static async findAll(options: IUserQueryOptions = {}): Promise<User[]> {
        let query = this
        .createQueryBuilder("user")
        .select("user");
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getMany();
    }

    public static async findByUid(uid: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let query = this
        .createQueryBuilder("user")
        .select("user")
        .where("user.uid = :uid", { uid });
        if (optionDefault(options.selectPassword, false)) {
            query = query.addSelect("user.password");
        }
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getOne();
    }

    public static async findByEmail(email: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let query = this
        .createQueryBuilder("user")
        .select("user")
        .where("user.email = :email", { email });
        if (optionDefault(options.selectPassword, false)) {
            query = query.addSelect("user.password");
        }
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getOne();
    }

    public static async countByEmail(email: string, options: IUserQueryOptions = {}): Promise<number> {
        let query = this
        .createQueryBuilder("user")
        .select()
        .where("user.email = :email", { email });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getCount();
    }

    @Column({ length: 36, unique: true })
    public uid: string;

    @Column({ length: 200})
    public email: string;

    @Column({ length: 100, select: false })
    public password: string;

    @Column({ length: 100 })
    public first_name: string;

    @Column({ length: 100 })
    public last_name: string;

}

interface IUserQueryOptions extends IBaseQueryOptions {
    selectPassword?: boolean;
}
