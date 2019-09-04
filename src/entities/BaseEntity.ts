/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Aug 29 2019
*/

import { BaseEntity as TypeOrmBaseEntity, Column, ObjectType, PrimaryGeneratedColumn, SaveOptions } from "typeorm";

export abstract class BaseEntity extends TypeOrmBaseEntity {

    public static save<T extends BaseEntity>(this: ObjectType<T>, entities: T[], options?: SaveOptions): Promise<T[]>;
    public static save<T extends BaseEntity>(this: ObjectType<T>, entity: T, options?: SaveOptions): Promise<T>;
    public static save<T extends BaseEntity>(this: ObjectType<T>, entityOrEntities: T | T[], options?: SaveOptions):
    Promise<T | T[]> {
        if (entityOrEntities instanceof Array) {
            for (const entity of entityOrEntities as T[]) {
                entity._updated_at = new Date();
            }
        } else {
            (entityOrEntities as T)._updated_at = new Date();
        }
        return super.save(entityOrEntities as any, options);
    }

    @PrimaryGeneratedColumn({ name: "id" })
    private _id: number;

    @Column({ name: "created_at" })
    private _created_at: Date = new Date();

    @Column({ name: "updated_at" })
    private _updated_at: Date = new Date();

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

    public save(): Promise<this> {
        this._updated_at = new Date();
        return super.save();
    }
}

export interface IBaseQueryOptions {
    hideDeleted?: boolean;
}

export function optionDefault(value: any, defaultValue: any): any {
    return value === undefined ? defaultValue : value;
}
