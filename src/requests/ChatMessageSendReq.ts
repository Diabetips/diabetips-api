/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { IsNotEmpty, IsString } from "class-validator";

import { ChatMessageAttachment } from "./ChatMessageAttachment";

export class ChatMessageSendReq {
    @IsString()
    @IsNotEmpty()
    content: string;

    attachments: ChatMessageAttachment[];
}
