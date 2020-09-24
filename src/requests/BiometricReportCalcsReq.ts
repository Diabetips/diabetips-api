/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Sep 24 2020
*/

import { isEnum } from "class-validator";
import { BiometricReportCalculationType } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

export class BiometricReportCalcsReq {
    public data: BiometricReportCalculationType[] | BiometricReportCalculationType = [];

    public init() {
        if (this.data === undefined) {
            this.data = [];
            return;
        }
        this.data = Array.isArray(this.data) ? this.data : [this.data] || [ ];
        this.verify();
    }

    public verify() {
        if (this.data === undefined) {
            return;
        }
        for (const d of this.data) {
            if (!isEnum(d, BiometricReportCalculationType)) {
                throw new ApiError(HttpStatus.BAD_REQUEST, "validation_error", `Report calculation type ${d} is invalid`)
            }
        }
    }
}