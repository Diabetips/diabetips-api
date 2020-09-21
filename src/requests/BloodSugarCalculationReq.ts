/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jul 01 2020
*/

import { BloodSugarCalculationType } from "../entities";

export class BloodSugarCalculationReq {
    public calcs: BloodSugarCalculationType[] | BloodSugarCalculationType = [];
}
