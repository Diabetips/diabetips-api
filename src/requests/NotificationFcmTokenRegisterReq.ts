/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jun 18 2020
*/

import { IsString, IsNotEmpty } from "class-validator";

export class NotificationFcmTokenRegisterReq {
    @IsString()
    @IsNotEmpty()
    public token: string;
}
