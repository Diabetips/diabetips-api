/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Aug 29 2019
*/

import { BaseEntity as TypeOrmBaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault } from "./BaseEntity";
export { getPageableQuery, IBaseQueryOptions, IBaseSearchRequest, optionDefault };

export abstract class BaseEntityHiddenId extends TypeOrmBaseEntity {

    @PrimaryGeneratedColumn({ name: "id" })
    private _id: number;

    @CreateDateColumn({ name: "created_at" })
    private _created_at: Date;

    @UpdateDateColumn({ name: "updated_at" })
    private _updated_at: Date;

    @Column({ name: "deleted_at", type: "datetime", nullable: true, default: undefined })
    private _deleted_at: Date | undefined = undefined;

    @Column({ name: "deleted", default: false })
    private _deleted: boolean = false;

    public get id(): number {
        return this._id;
    }

    public get createdAt(): Date {
        return this._created_at;
    }

    public get updateAt(): Date {
        return this._updated_at;
    }

    public get deletedAt(): Date | undefined {
        return this._deleted_at;
    }

    public get deleted(): boolean {
        return this._deleted;
    }

    public set deleted(deleted: boolean) {
        this._deleted = deleted;
        this._deleted_at = deleted ? new Date() : undefined;
    }

}
