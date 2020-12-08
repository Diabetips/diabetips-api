/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { config } from "../config";
import { ChatAttachment, ChatMessage } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";
import { ChatMessageEditReq, ChatMessageSendReq } from "../requests";
import { ChatWebSocket } from "../ws";

import { AuthService } from "./AuthService";
import { NotificationService } from "./NotificationService";
import { UserService } from "./UserService";

type ChatMessageBase = Pick<ChatMessage, "id" | "time" | "content" | "edited">;

type ChatConversation = ChatMessageBase & {
    with: string;
    from: string;
};

type ChatMessageResult = ChatMessageBase & {
    from: string;
    to: string;
};

const wsClients: {
    [key: string]: ChatWebSocket[];
} = {};

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

    public static async getMessages(uid: string, otherUid: string, p: Pageable): Promise<Page<ChatMessageResult>> {
        const page = await ChatMessage.findByUids(uid, otherUid, p);
        return new Page(p, [
            await Promise.all(page.body.map(this.chatMessageResult)),
            page.count,
        ]);
    }

    public static async sendMessage(uid: string, otherUid: string, req: ChatMessageSendReq): Promise<ChatMessageResult> {
        const [from, to] = await Promise.all([
            UserService.getUser(uid),
            UserService.getUser(otherUid),
        ]);

        let msg = new ChatMessage();
        msg.from = Promise.resolve(from);
        msg.to = Promise.resolve(to);
        msg.content = req.content;
        msg = await msg.save();

        msg.attachments = await Promise.all(req.attachments.map(async (a) => {
            let ca = new ChatAttachment();
            ca.message = msg;
            ca.filename = a.filename;
            ca.blob = a.data;
            ca.size = a.data.length;
            ca = await ca.save();
            return {
                filename: ca.filename,
                size: ca.size,
            } as any; // YEP
        }));

        const res = await this.chatMessageResult(msg);
        this.sendMessageByWs(uid, res);
        if (!this.sendMessageByWs(otherUid, res)) {
            const imageToken = await AuthService.generateUrlAccessToken(to);
            const imageUrl = `${config.diabetips.apiUrl}/v1/users/${from.uid}/picture?token=${imageToken}`;

            await NotificationService.sendNotification(to, "chat_message", {
                msg_id: msg.id,
                from_uid: from.uid,
            }, imageUrl, { from, content: msg.content });
        }

        return res;
    }

    public static async editMessage(uid: string, otherUid: string, messageId: string, req: ChatMessageEditReq): Promise<ChatMessageResult> {
        let msg = await ChatMessage.findById(uid, otherUid, messageId);
        if (msg == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "message_not_found", "Message not found");
        }
        msg.content = req.content;
        msg.edited = true;
        msg = await msg.save();

        const res = await this.chatMessageResult(msg);

        this.sendMessageByWs(uid, res);
        this.sendMessageByWs(otherUid, res);

        return res;
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

    private static async chatMessageResult(msg: ChatMessage): Promise<ChatMessageResult> {
        const [from, to] = await Promise.all([msg.from, msg.to]);
        return {
            ...msg,
            from: from.uid,
            to: to.uid,
        };
    }

    public static async registerWsClient(uid: string, client: ChatWebSocket) {
        (wsClients[uid] ??= []).push(client);
    }

    public static async unregisterWsClient(uid: string, client: ChatWebSocket) {
        if (wsClients[uid] != null) {
            wsClients[uid] = wsClients[uid].filter((c) => c !== client);
            if (wsClients[uid].length === 0) {
                delete wsClients[uid];
            }
        }
    }

    private static sendMessageByWs(uid: string, msg: ChatMessageResult): boolean {
        if (wsClients[uid] == null) {
            return false;
        }

        wsClients[uid].forEach((client) => {
            client.sendJsonMessage(msg);
        });
        return true;
    }

}
