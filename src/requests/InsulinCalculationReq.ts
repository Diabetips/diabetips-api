/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Jul 14 2020
*/

import { InsulinCalculationType } from "../entities";
import { isEnum } from "class-validator";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

export class InsulinCalculationReq {
    public calcs: InsulinCalculationType[] | InsulinCalculationType = [];

    public init() {
        if (this.calcs === undefined) {
            this.calcs = [];
            return;
        }
        this.calcs = Array.isArray(this.calcs) ? this.calcs : [this.calcs] || [ ];
        this.verify();
    }

    public verify() {
        if (this.calcs === undefined) {
            return;
        }
        for (const c of this.calcs) {
            if (!isEnum(c, InsulinCalculationType)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, "validation_error", `Insulin calculation type ${c} is invalid`)
            }
        }
    }
}