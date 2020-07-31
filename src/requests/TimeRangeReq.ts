/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 28 2020
*/

import { Timeable } from "../lib";

export class TimeRangeReq extends Timeable {
    public start: Date;
    public end: Date;
}
