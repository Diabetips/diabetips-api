/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { IsNotEmpty, IsString } from "class-validator";

export class ChatMessageEditReq {
    @IsString()
    @IsNotEmpty()
    content: string;
}
