/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Apr 01 2020
*/

import { IsInt, IsPositive } from "class-validator";

export class MealFoodReq {
    @IsInt()
    @IsPositive()
    public id: number;

    @IsInt()
    @IsPositive()
    public quantity: number;
}
