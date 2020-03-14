/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sat Mar 14 2020
*/

import { IsInt, IsPositive, Min } from "class-validator";
import { SelectQueryBuilder } from "typeorm";

export class Timeable {
    @IsInt()
    @Min(0)
    public start: number = 0;

    @IsInt()
    @IsPositive()
    public end: number = Math.round((new Date()).getTime() / 1000);

    public applyTimeRange<T>(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        return qb.andWhere(qb.alias + ".timestamp BETWEEN :start AND :end", { start: this.start, end: this.end });
    }
}
