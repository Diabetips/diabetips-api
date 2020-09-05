/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Sep 05 2020
*/

import { Response } from "express";
import { Body, Ctx, Delete, Get, JsonController, Param, Post, Put, QueryParams, Res, UploadedFiles } from "routing-controllers";

import { Authorized, Pageable, UserContext } from "../lib";
import { ChatMessageEditReq, ChatMessageSendReq } from "../requests";
import { ChatService } from "../services";

@JsonController("/v1/chat")
export class ChatController {

    @Get("/")
    @Authorized("chat")
    public async getConversations(@Ctx() ctx: UserContext,
                                  @QueryParams() p: Pageable,
                                  @Res() res: Response) {
        const page = await ChatService.getAllConversations(ctx.auth.uid, p);
        return page.send(res);
    }

    @Get("/:uid")
    @Authorized("chat")
    public async getConversation(@Ctx() ctx: UserContext,
                                 @Param("uid") uid: string,
                                 @QueryParams() p: Pageable,
                                 @Res() res: Response) {
        const page = await ChatService.getMessages(ctx.auth.uid, uid, p);
        return page.send(res);
    }

    @Post("/:uid")
    @Authorized("chat")
    public async sendMessage(@Ctx() ctx: UserContext,
                             @Param("uid") uid: string,
                             @UploadedFiles("attachments") attachments: Express.Multer.File[],
                             @Body() req: ChatMessageSendReq) {
        req.attachments = attachments?.map((a, idx) => ({
            filename: a.originalname ?? `attachment_${idx + 1}`,
            data: a.buffer,
        })) ?? [];
        return ChatService.sendMessage(ctx.auth.uid, uid, req);
    }

    @Put("/:uid/:id")
    @Authorized("chat")
    public async editMessage(@Ctx() ctx: UserContext,
                             @Param("uid") uid: string,
                             @Param("id") messageId: string,
                             @Body() req: ChatMessageEditReq) {
        return ChatService.editMessage(ctx.auth.uid, uid, messageId, req);
    }

    @Delete("/:uid/:id")
    @Authorized("chat")
    public async removeMessage(@Ctx() ctx: UserContext,
                               @Param("uid") uid: string,
                               @Param("id") messageId: string) {
        await ChatService.removeMessage(ctx.auth.uid, uid, messageId);
    }

    @Get("/:uid/:id/attachments/:filename")
    @Authorized("chat")
    public async downloadAttachment(@Ctx() ctx: UserContext,
                                    @Param("uid") uid: string,
                                    @Param("id") messageId: string,
                                    @Param("filename") filename: string) {
        return ChatService.downloadAttachment(ctx.auth.uid, uid, messageId, filename);
    }

}
