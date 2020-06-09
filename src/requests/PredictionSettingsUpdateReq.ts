/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Mar 16 2020
*/

import { IsBoolean, IsOptional } from "class-validator";

export class PredictionSettingsUpdateReq {
    @IsOptional()
    @IsBoolean()
    public enabled?: boolean;
}
