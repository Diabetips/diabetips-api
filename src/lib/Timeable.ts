/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { IsInt, IsPositive, Min, IsOptional } from "class-validator";
import { SelectQueryBuilder } from "typeorm";

export class Timeable {
    @IsOptional()
    @IsInt()
    @Min(0)
    public start?: number;

    @IsOptional()
    @IsInt()
    @IsPositive()
    public end?: number;

    public applyTimeRange<T>(qb: SelectQueryBuilder<T>, isPeriod: boolean = false): SelectQueryBuilder<T> {
        const val = qb.alias + (isPeriod ? ".start" : ".timestamp")

        qb = this.start === undefined ? qb : qb.andWhere(`:start <= ${val}`, { start: this.start });
        qb = this.end === undefined ? qb : qb.andWhere(`${val} <= :end`, { end: this.end });
        return qb;
    }
}
