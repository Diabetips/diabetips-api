/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import { Response } from "express";
import { Body, Ctx, Delete, Get, JsonController, Param, Post, QueryParams, Res } from "routing-controllers";

import { Authorized, Pageable, UserContext } from "../lib";
import { NotificationFcmTokenRegisterReq } from "../requests";
import { NotificationService } from "../services";

@JsonController("/v1/notifications")
export class NotificationController {

    @Get("/")
    @Authorized("notifications")
    public async getAllNotifications(@Ctx() ctx: UserContext, @QueryParams() p: Pageable, @Res() res: Response) {
        const page = await NotificationService.getAllNotifications(ctx.auth.uid, p);
        return page.send(res);
    }

    @Post("/fcm_token")
    @Authorized("notifications")
    public async registerFcmToken(@Ctx() ctx: UserContext, @Body() req: NotificationFcmTokenRegisterReq) {
        await NotificationService.registerFcmToken(ctx.auth.uid, req);
    }

    @Delete("/:id")
    @Authorized("notifications")
    public async markNotificationRead(@Ctx() ctx: UserContext, @Param("id") notifId: string) {
        await NotificationService.markNotificationRead(ctx.auth.uid, notifId);
    }

}
