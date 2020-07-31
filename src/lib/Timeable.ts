/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { IsString, Min, IsOptional, IsISO8601 } from "class-validator";
import { SelectQueryBuilder } from "typeorm";
import { TimeRangeReq } from "../requests";

export class Timeable {
    @IsOptional()
    @IsString()
    @IsISO8601()
    public start?: Date;

    @IsOptional()
    @IsString()
    @IsISO8601()
    public end?: Date;

    public applyTimeRange<T>(qb: SelectQueryBuilder<T>, isPeriod: boolean = false): SelectQueryBuilder<T> {
        const val = qb.alias + (isPeriod ? ".start" : ".time")

        qb = this.start === undefined ? qb : qb.andWhere(`:start <= ${val}`, { start: this.start });
        qb = this.end === undefined ? qb : qb.andWhere(`${val} <= :end`, { end: this.end });
        return qb;
    }
}
