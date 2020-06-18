/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import admin = require("firebase-admin");

import { Notification, User, NotificationFcmToken } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable, Utils } from "../lib";
import { NotificationFcmTokenRegisterReq } from "../requests";
import { NotificationsWebSocket } from "../ws";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

const wsClients: {
    [key: string]: NotificationsWebSocket[];
} = {};

export class NotificationService extends BaseService {

    public static async sendNotification(target: User, type: string, data: any) {
        let notif = new Notification();
        notif.type = type;
        notif.data = data;
        notif.target = Promise.resolve(target);

        notif = await notif.save();

        if (wsClients[target.uid] != null) {
            wsClients[target.uid].forEach((client) => {
                client.sendJsonMessage(notif);
            });
        }

        const fcmTokens = await target.notificationFcmTokens;
        if (fcmTokens.length > 0) {
            await admin.messaging().sendMulticast({
                data: {
                    "notification": JSON.stringify(notif, Utils.jsonReplacer),
                },
                tokens: fcmTokens.map((nt) => nt.token)
            });
        }
    }

    public static async getAllNotifications(uid: string, p: Pageable): Promise<Page<Notification>> {
        return Notification.findAll(uid, p);
    }

    public static async markNotificationRead(uid: string, notifId: string) {
        const notif = await Notification.findById(uid, notifId);
        if (notif === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "notification_not_found", `Notification ${notifId} not found`);
        }
        notif.read = true;
        return notif.save();
    }

    public static async registerWsClient(uid: string, client: NotificationsWebSocket) {
        client.sendJsonMessage(await Notification.findAllUnread(uid));
        if (wsClients[uid] == null) {
            wsClients[uid] = [];
        }
        wsClients[uid].push(client);
    }

    public static async unregisterWsClient(uid: string, client: NotificationsWebSocket) {
        if (wsClients[uid] != null) {
            wsClients[uid] = wsClients[uid].filter((c) => c !== client);
            if (wsClients[uid].length === 0) {
                delete wsClients[uid];
            }
        }
    }

    public static async registerFcmToken(uid: string, req: NotificationFcmTokenRegisterReq) {
        const user = await UserService.getUser(uid, { selectNotificationFcmTokens: true });

        // Check if token is already registered
        if ((await user.notificationFcmTokens).map((nt) => nt.token).indexOf(req.token) !== -1) {
            return;
        }

        const nt = new NotificationFcmToken();
        nt.user = Promise.resolve(user);
        nt.token = req.token;

        await nt.save();
    }

}
