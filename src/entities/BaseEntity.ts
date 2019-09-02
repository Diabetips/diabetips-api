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
                entity.updatedAt = new Date();
            }
        } else {
            (entityOrEntities as T).updatedAt = new Date();
        }
        return super.save(entityOrEntities as any, options);
    }

    @PrimaryGeneratedColumn()
    private id: number;

    @Column()
    private createdAt: Date = new Date();

    @Column()
    private updatedAt: Date = new Date();

    @Column({ type: "datetime", nullable: true, default: undefined })
    private deletedAt: Date | undefined = undefined;

    @Column({ default: false })
    private deleted: boolean = false;

    public get $id(): number {
        return this.id;
    }

    public get $createdAt(): Date {
        return this.createdAt;
    }

    public get $deleted(): boolean {
        return this.deleted;
    }

    public set $deleted(deleted: boolean) {
        this.deleted = deleted;
        this.deletedAt = deleted ? new Date() : undefined;
    }

    public save(): Promise<this> {
        this.updatedAt = new Date();
        return super.save();
    }
}

export interface IBaseQueryOptions {
    hideDeleted?: boolean;
}

export function optionDefault(value: any, defaultValue: any): any {
    return value === undefined ? defaultValue : value;
}
