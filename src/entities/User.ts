/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import bcrypt = require("bcrypt");

import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { ApiModelProperty } from "swagger-express-ts";
import { BaseEntityHiddenId, IBaseQueryOptions, optionDefault } from "./BaseEntityHiddenId";
import { UserMeal } from "./UserMeal";

export interface IUserQueryOptions extends IBaseQueryOptions {
    selectPassword?: boolean;
}

@Entity()
export class User extends BaseEntityHiddenId {

    @ApiModelProperty({
        description: "Users's UID",
        example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    })
    @Column({ length: 36, unique: true })
    public uid: string;

    @ApiModelProperty({
        description: "Users's email",
        example: "user@example.com",
    })
    @Column({ length: 200 })
    @Index()
    public email: string;

    @Column({ name: "password", length: 100, select: false })
    private _password?: string;

    @ApiModelProperty({
        description: "Users's first name",
        example: "John",
    })
    @Column({ length: 100 })
    public first_name: string;

    @ApiModelProperty({
        description: "Users's first name",
        example: "Snow",
    })    
    @Column({ length: 100 })
    public last_name: string;

    @OneToMany((type) => UserMeal, (meal) => meal.user)
    public meals: Promise<UserMeal[]>;

    public get password(): string | undefined {
        return this._password;
    }

    public set password(password: string | undefined) {
        this._password = password === undefined ? undefined : bcrypt.hashSync(password, 12);
    }

    @ManyToMany((type) => User)
    @JoinTable({
        name: "user_connections",
        joinColumn: {
            name: "source_user",
        },
        inverseJoinColumn: {
            name: "target_user",
        },
    })
    public connections: Promise<User[]>;

    // Repository functions

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
            .where("user.email = :email", { email });
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
            .where("user.email = :email", { email });
        if (optionDefault(options.hideDeleted, true)) {
            query = query.andWhere("user.deleted = 0");
        }
        return query.getCount();
    }

}
