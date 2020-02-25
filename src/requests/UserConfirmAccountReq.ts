/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Feb 24 2020
*/

import { IsUUID } from "class-validator";

export class UserConfirmAccountReq {
    @IsUUID()
    public code: string;
}
