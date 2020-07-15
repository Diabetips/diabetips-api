/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jun 10 2020
*/

import { isEnum } from "class-validator";
import { InsulinType, Insulin } from "../entities";
import { SelectQueryBuilder, Brackets } from "typeorm";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

export class InsulinSearchReq {
    public types?: string[];

    public apply(qb: SelectQueryBuilder<Insulin>): SelectQueryBuilder<Insulin> {
        if (this.types === undefined) {
            return qb;
        }
        const types = this.types;
        qb = qb.andWhere(new Brackets((sub) => {
            let i = 0;
            for (const t of types) {
                const param: { [key: string]: any } = {};
                param[`type${i}`] = t;
                sub = sub.orWhere(`insulin.type = :type${i}`, param)
                i++;
            }
        }))
        return qb;
    }

    public init() {
        if (this.types === undefined) {
            return;
        }
        this.types = Array.isArray(this.types) ? this.types : [this.types] || [ ]
        this.verify();
    }

    public verify() {
        if (this.types === undefined) {
            return;
        }
        for (const t of this.types) {
            if (!isEnum(t, InsulinType)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, "validation_error", `Insulin type ${t} is invalid`)
            }
        }
    }
}