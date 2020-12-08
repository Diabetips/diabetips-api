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

// Temp imports for test route
import { config } from "../config";
import { AuthService, UserService } from "../services";

@JsonController("/v1/notifications")
export class UserNotificationController {

    @Get("/")
    @Authorized("notifications")
    public async getAllNotifications(@Ctx() ctx: UserContext, @QueryParams() p: Pageable, @Res() res: Response) {
        const page = await NotificationService.getAllNotifications(ctx.auth.uid, p);
        return page.send(res);
    }

    // DEBUG
    @Get("/test")
    public async test(@Ctx() ctx: UserContext) {
        const user = await UserService.getUser(ctx.auth.uid);
        const imageToken = await AuthService.generateUrlAccessToken(user);
        await NotificationService.sendNotification(user, "test", {
            foo: "aled",
            bar: "oskour",
        }, `${config.diabetips.apiUrl}/v1/users/me/picture?token=${imageToken}`);
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
