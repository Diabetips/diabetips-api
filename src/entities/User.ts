/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import bcrypt = require("bcrypt");

import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions, IBaseSearchRequest } from "./BaseEntityHiddenId";

import { AuthApp } from "./AuthApp";
import { Hba1c } from "./Hba1c";
import { Insulin } from "./Insulin";
import { Meal } from "./Meal";

import { UserConfirmation } from "./UserConfirmation";
import { UserPicture } from "./UserPicture";
export { UserConfirmation, UserPicture };

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

    @OneToOne((type) => UserConfirmation, (confirmation) => confirmation.user)
    public confirmation: Promise<UserConfirmation>;

    @OneToOne((type) => UserPicture, (picture) => picture.user)
    public picture: Promise<UserPicture>;

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

    @OneToMany((type) => Hba1c, (hba1c) => hba1c.user)
    public hba1c: Promise<Hba1c[]>;

    public get password(): string | undefined {
        return this._password;
    }

    public set password(password: string | undefined) {
        this._password = password === undefined ? undefined : bcrypt.hashSync(password, 12);
    }

    // Repository functions

    public static async findAll(p: Pageable,
                                req: IBaseSearchRequest = {},
                                options: IUserQueryOptions = {}):
                                Promise<Page<User>> {
        let qb = this.createQueryBuilder("user");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0");
        }

        return p.query(qb);
    }

    public static async findByUid(uid: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let qb = this
            .createQueryBuilder("user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.selectPassword, false)) {
            qb = qb.addSelect("user.password", "user_password");
        }
        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0");
        }

        return qb.getOne();
    }

    public static async hasUid(uid: string, options: IUserQueryOptions = {}): Promise<boolean> {
        return await this.findByUid(uid, options) != null;
    }

    public static async findByEmail(email: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let qb = this
            .createQueryBuilder("user")
            .where("lower(user.email) = lower(:email)", { email });

        if (Utils.optionDefault(options.selectPassword, false)) {
            qb = qb.addSelect("user.password", "user_password");
        }
        if (Utils.optionDefault(options.selectConfirmation, false)) {
            qb = qb.leftJoinAndSelect("user.confirmation", "confirmation");
        }
        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0");
        }

        return qb.getOne();
    }

    public static async countByEmail(email: string, options: IUserQueryOptions = {}): Promise<number> {
        let qb = this
            .createQueryBuilder("user")
            .where("lower(user.email) = lower(:email)", { email });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = 0");
        }

        return qb.getCount();
    }

}

export interface IUserQueryOptions extends IBaseQueryOptions {
    selectPassword?: boolean;
    selectConfirmation?: boolean;
}

// tslint:disable-next-line: no-empty-interface
export interface IUserSearchRequest extends IBaseSearchRequest {
}
