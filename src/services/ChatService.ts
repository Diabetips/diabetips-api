/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { ChatAttachment, ChatMessage } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";
import { ChatMessageEditReq, ChatMessageSendReq } from "../requests";

import { UserService } from "./UserService";

// TODO ws/notif

type ChatConversation = Pick<ChatMessage, "id" | "time" | "content" | "edited"> & {
    with: string;
    from: string;
};

export class ChatService {

    public static async getAllConversations(uid: string, p: Pageable): Promise<Page<ChatConversation>> {
        const page = await ChatMessage.findByUid(uid, p);
        return new Page(p, [
            await Promise.all(page.body.map(async (m): Promise<ChatConversation> => {
                const [from, to] = await Promise.all([m.from, m.to]);
                return {
                    ...m,
                    with: from.uid === uid ? to.uid : from.uid,
                    from: from.uid,
                };
            })),
            page.count,
        ]);
    }

    public static async getMessages(uid: string, otherUid: string, p: Pageable): Promise<Page<ChatMessage>> {
        return ChatMessage.findByUids(uid, otherUid, p);
    }

    public static async sendMessage(uid: string, otherUid: string, req: ChatMessageSendReq): Promise<ChatMessage> {
        let msg = new ChatMessage();
        msg.from = Promise.resolve(await UserService.getUser(uid));
        msg.to = Promise.resolve(await UserService.getUser(otherUid));
        msg.content = req.content;
        msg = await msg.save();

        await Promise.all(req.attachments.map((a) => {
            const ca = new ChatAttachment();
            ca.message = msg;
            ca.filename = a.filename;
            ca.blob = a.data;
            return ca.save();
        }));

        return msg;
    }

    public static async editMessage(uid: string, otherUid: string, messageId: string, req: ChatMessageEditReq): Promise<ChatMessage> {
        const msg = await ChatMessage.findById(uid, otherUid, messageId);
        if (msg == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "message_not_found", "Message not found");
        }
        msg.content = req.content;
        msg.edited = true;
        return msg.save();
    }

    public static async removeMessage(uid: string, otherUid: string, messageId: string): Promise<void> {
        const msg = await ChatMessage.findById(uid, otherUid, messageId);
        if (msg == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "message_not_found", "Message not found");
        }
        await msg.remove();
    }

    public static async downloadAttachment(uid: string, otherUid: string, messageId: string, filename: string): Promise<Buffer> {
        const attachment = await ChatAttachment.findByName(uid, otherUid, messageId, filename);
        if (attachment == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "attachment_not_found", "Attachment not found");
        }
        return attachment.blob;
    }

}
