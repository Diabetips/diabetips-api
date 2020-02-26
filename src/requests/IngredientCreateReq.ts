/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsInt, IsNumber, IsPositive } from "class-validator";

export class IngredientCreateReq {
    @IsInt()
    public food_id: number;

    @IsNumber()
    @IsPositive()
    public quantity: number;
}
