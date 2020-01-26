/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Aug 29 2019
*/

import { BaseEntity as TypeOrmBaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, SelectQueryBuilder,
    UpdateDateColumn } from "typeorm";

export abstract class BaseEntity extends TypeOrmBaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @CreateDateColumn({ name: "created_at" })
    private _created_at: Date;

    @UpdateDateColumn({ name: "updated_at" })
    private _updated_at: Date;

    @Column({ name: "deleted_at", type: "datetime", nullable: true, default: undefined })
    private _deleted_at: Date | undefined = undefined;

    @Column({ name: "deleted", default: false })
    private _deleted: boolean = false;

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

export interface IBaseQueryOptions {
    hideDeleted?: boolean;
}

export interface IBaseSearchRequest {
    page?: number;
    size?: number;
}

export function optionDefault(value: any, defaultValue: any): any {
    return value === undefined ? defaultValue : value;
}

export function getPageHeader(count: number, req: IBaseSearchRequest): string {
    const size = Number(optionDefault(req.size, 20));
    const page = Number(optionDefault(req.page, 1));

    const last = Math.ceil(count / size);
    const previous = page <= 1 ? 1 : Math.min(page - 1, last);
    const next = Math.min(last, page + 1);

    let str = previous === page ? "" : `previous: ${previous}; `;
    str += next <= page ? "" : `next: ${next}; `;
    str += `last: ${last}`;
    return str;
}

export function getPageableQuery<T>(query: SelectQueryBuilder<T>, req: IBaseSearchRequest): SelectQueryBuilder<T> {
    const size = Number(optionDefault(req.size, 20));
    const page = Number(optionDefault(req.page, 1)) - 1;

    if (page !== undefined && size !== undefined) {
        query = query.limit(size)
                     .offset(size * page);
    }
    return query;
}

// Use manualPagination if you want pagination in a request with JOINs
export async function manualPagination<T>(results: Promise<T[]>, req: IBaseSearchRequest): Promise<T[]> {
    const size = Number(optionDefault(req.size, 20));
    const page = Number(optionDefault(req.page, 1)) - 1;

    const start: number = page * size;
    const end: number = start + size;

    // Slice seems to handle [index out of reach] on its own :)
    return (await results).slice(start, end);
}
