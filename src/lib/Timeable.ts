/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { Type } from "class-transformer";
import { IsDate, ValidateIf } from "class-validator";
import { SelectQueryBuilder } from "typeorm";

export enum PeriodMode {
    HOURLY = "hourly",
    DAILY = "daily",
}

export class Timeable {
    // conditional IsOptional
    @ValidateIf((t) => t.start !== undefined  || t.constructor !== Timeable)
    @IsDate()
    @Type(() => Date)
    public start?: Date;

    // conditional IsOptional
    @ValidateIf((t) => t.end !== undefined  || t.constructor !== Timeable)
    @IsDate()
    @Type(() => Date)
    public end?: Date;

    public applyTimeRange<T>(qb: SelectQueryBuilder<T>, isPeriod: boolean = false): SelectQueryBuilder<T> {
        const val = qb.alias + (isPeriod ? ".start" : ".time")

        qb = this.start === undefined ? qb : qb.andWhere(`:start <= ${val}`, { start: this.start });
        qb = this.end === undefined ? qb : qb.andWhere(`${val} <= :end`, { end: this.end });
        return qb;
    }
}
