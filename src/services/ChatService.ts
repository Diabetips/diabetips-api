/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { Page, Pageable } from "../lib";
import { ChatMessageEditReq, ChatMessageSendReq } from "../requests";

export class ChatService {

    public static async getAllConversations(uid: string, p: Pageable): Promise<Page<null>> {
        return new Page(p, [[], 0]);
    }

    public static async getMessages(uid: string, otherUid: string, p: Pageable): Promise<Page<null>> {
        return new Page(p, [[], 0]);
    }

    public static async sendMessage(uid: string, otherUid: string, req: ChatMessageSendReq): Promise<null> {
        return null;
    }

    public static async editMessage(uid: string, otherUid: string, messageId: string, req: ChatMessageEditReq): Promise<null> {
        return null;
    }

    public static async removeMessage(uid: string, otherUid: string, messageId: string): Promise<void> {
        return;
    }

}
