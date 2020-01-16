/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import bcrypt = require("bcrypt");

import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { BaseEntityHiddenId, IBaseQueryOptions, optionDefault } from "./BaseEntityHiddenId";

import { AuthApp, Meal } from ".";
import { getPageableQuery, IBaseSearchRequest } from "./BaseEntity";
import { HbA1C } from "./HbA1C";
import { Insulin } from "./Insulin";

@Entity()
export class User extends BaseEntityHiddenId {

    @Column({ length: 36, unique: true })
    public uid: string;

    @Column({ length: 200 })
    @Index()
    public email: string;

    @Column({ name: "password", length: 100, select: false })
    private _password?: string;

    @Column({ length: 10 })
    public lang: string;

    @Column({ length: 100 })
    public first_name: string;

    @Column({ length: 100 })
    public last_name: string;

    @ManyToMany((type) => AuthApp)
    @JoinTable({
        name: "user_apps",
        joinColumn: {
            name: "user_id",
        },
        inverseJoinColumn: {
            name: "app_id",
        },
    })
    public apps: Promise<AuthApp[]>;

    @ManyToMany((type) => User)
    @JoinTable({
        name: "user_connections",
        joinColumn: {
            name: "source_user_id",
        },
        inverseJoinColumn: {
            name: "target_user_id",
        },
    })
    public connections: Promise<User[]>;

    @OneToMany((type) => Meal, (meal) => meal.user)
    public meals: Promise<Meal[]>;

    @OneToMany((type) => Insulin, (insulin) => insulin.user)
    public insulin: Promise<Insulin[]>;

    @OneToMany((type) => HbA1C, (hba1c) => hba1c.user)
    public hba1c: Promise<HbA1C[]>;

    public get password(): string | undefined {
        return this._password;
    }

    public set password(password: string | undefined) {
        this._password = password === undefined ? undefined : bcrypt.hashSync(password, 12);
    }

    // Repository functions

    public static async findAll(req: IBaseSearchRequest = {}, options: IUserQueryOptions = {}): 
                                Promise<[Promise<User[]>, Promise<number>]> {
        let query = this
            .createQueryBuilder("user")
            .select("user");
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }

        query = getPageableQuery(query, req);

        return [query.getMany(), query.getCount()];
    }

    public static async findByUid(uid: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let query = this
            .createQueryBuilder("user")
            .select("user")
            .where("user.uid = :uid", { uid });
        if (optionDefault(options.selectPassword, false)) {
            query = query.addSelect("user.password", "user_password");
        }
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getOne();
    }

    public static async hasUid(uid: string, options: IUserQueryOptions = {}): Promise<boolean> {
        return await this.findByUid(uid, options) != null;
    }

    public static async findByEmail(email: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let query = this
            .createQueryBuilder("user")
            .select("user")
            .where("lower(user.email) = lower(:email)", { email });
        if (optionDefault(options.selectPassword, false)) {
            query = query.addSelect("user.password", "user_password");
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
            .where("lower(user.email) = lower(:email)", { email });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getCount();
    }

}

export interface IUserQueryOptions extends IBaseQueryOptions {
    selectPassword?: boolean;
}

// tslint:disable-next-line: no-empty-interface
export interface IUserSearchRequest extends IBaseSearchRequest {
}
