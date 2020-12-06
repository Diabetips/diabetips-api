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
import { getLang } from "../i18n";
import { HttpStatus, Page, Pageable } from "../lib";
import { logger } from "../logger";
import { NotificationFcmTokenRegisterReq } from "../requests";
import { NotificationsWebSocket } from "../ws";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

const wsClients: {
    [key: string]: NotificationsWebSocket[];
} = {};

export class NotificationService extends BaseService {

    public static async sendNotification(target: User, type: string, data: { [key: string]: string }, imageUrl?: string, i18nParams: { [key: string]: any } = {}) {
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
            const i18nTemplate = getLang(target.lang)?.notif[type];
            if (!i18nTemplate) {
                logger.warn(`Missing notification i18n template for lang ${target.lang} and type ${type}`);
            }

            const res = await admin.messaging().sendMulticast({
                notification: (i18nTemplate ? {
                    ...i18nTemplate(i18nParams),
                    imageUrl,
                } : undefined),
                data: {
                    id: notif.id,
                    type,
                    ...data,
                },
                tokens: fcmTokens.map((nt) => nt.token)
            });
            if (res.failureCount > 0) {
                res.responses.forEach((r) => {
                    logger.error("Failed to send notification:", r.error);
                });
            }
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
        (wsClients[uid] ??= []).push(client);
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

        // Delete previous registrations of the token to other users.
        NotificationFcmToken.deleteToken(req.token);

        const nt = new NotificationFcmToken();
        nt.user = Promise.resolve(user);
        nt.token = req.token;

        await nt.save();
    }

}
