/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import { Response } from "express";
import { Delete, Get, JsonController, Param, QueryParams, Res, Post, Body } from "routing-controllers";

import { Authorized, Pageable } from "../lib";
import { NotificationFcmTokenRegisterReq } from "../requests";
import { NotificationService } from "../services";

// Temp imports for test route
import { config } from "../config";
import { AuthService, UserService } from "../services";

@JsonController("/v1/users/:uid/notifications")
export class UserNotificationController {

    @Get("/")
    @Authorized("notifications")
    public async getAllNotifications(@Param("uid") uid: string, @QueryParams() p: Pageable, @Res() res: Response) {
        const page = await NotificationService.getAllNotifications(uid, p);
        return page.send(res);
    }

    // DEBUG
    @Get("/test")
    public async test(@Param("uid") uid: string) {
        const user = await UserService.getUser(uid);
        const imageToken = await AuthService.generateUrlAccessToken(user);
        await NotificationService.sendNotification(user, "test", {
            foo: "aled",
            bar: "oskour",
        }, `${config.diabetips.apiUrl}/v1/users/me/picture?token=${imageToken}`);
    }

    @Post("/fcm_token")
    @Authorized("notifications")
    public async registerFcmToken(@Param("uid") uid: string, @Body() req: NotificationFcmTokenRegisterReq) {
        await NotificationService.registerFcmToken(uid, req);
    }

    @Delete("/:id")
    @Authorized("notifications")
    public async markNotificationRead(@Param("uid") uid: string, @Param("id") notifId: string) {
        await NotificationService.markNotificationRead(uid, notifId);
    }

}
