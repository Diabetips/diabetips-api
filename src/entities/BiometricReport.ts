import { BloodSugarCalculation } from ".";
/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Thu Sep 24 2020
*/

import { InsulinReport } from "./InsulinReport";

export enum BiometricReportCalculationType {
    INSULIN = "insulin",
    BLOOD_SUGAR = "blood_sugar",
}

export class BiometricReport {
    public insulin: InsulinReport;
    public blood_sugar: BloodSugarCalculation;
}