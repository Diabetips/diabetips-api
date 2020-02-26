/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Feb 25 2020
*/

import { IsOptional, IsString } from "class-validator";

export class FoodSearchReq {
    @IsOptional()
    @IsString()
    public name?: string;
}
