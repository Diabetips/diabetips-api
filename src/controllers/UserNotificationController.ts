/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Mar 15 2020
*/

import { Response } from "express";
import { Delete, Get, JsonController, Param, QueryParams, Res, Post, Body } from "routing-controllers";

import { Pageable } from "../lib";
import { NotificationFcmTokenRegisterReq } from "../requests";
import { NotificationService } from "../services";

import { UserService } from "../services";

@JsonController("/v1/users/:uid/notifications")
export class UserNotificationController {

    @Get("/")
    public async getAllNotifications(@Param("uid") uid: string, @QueryParams() p: Pageable, @Res() res: Response) {
        const page = await NotificationService.getAllNotifications(uid, p);
        return page.send(res);
    }

    @Get("/test")
    public async test(@Param("uid") uid: string) {
        const user = await UserService.getUser(uid);
        await NotificationService.sendNotification(user, "test", {
            foo: "aled",
            bar: "oskour",
        });
    }

    @Post("/fcm_token")
    public async registerFcmToken(@Param("uid") uid: string, @Body() req: NotificationFcmTokenRegisterReq) {
        await NotificationService.registerFcmToken(uid, req);
    }

    @Delete("/:id")
    public async markNotificationRead(@Param("uid") uid: string, @Param("id") notifId: string) {
        await NotificationService.markNotificationRead(uid, notifId);
    }

}
