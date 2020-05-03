/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Apr 29 2020
*/

import { Notification, User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus, Page, Pageable } from "../lib";
import { NotificationsWebSocket } from "../ws";

import { BaseService } from "./BaseService";

const clients: {
    [key: string]: NotificationsWebSocket[];
} = {};

export class NotificationService extends BaseService {

    public static async sendNotification(target: User, type: string, data: any) {
        let notif = new Notification();
        notif.type = type;
        notif.data = data;
        notif.target = Promise.resolve(target);

        notif = await notif.save();

        if (clients[target.uid] != null) {
            clients[target.uid].forEach((client) => {
                client.sendJsonMessage(notif);
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

    public static async registerClient(uid: string, client: NotificationsWebSocket) {
        client.sendJsonMessage(await Notification.findAllUnread(uid));
        if (clients[uid] == null) {
            clients[uid] = [];
        }
        clients[uid].push(client);
    }

    public static async unregisterClient(uid: string, client: NotificationsWebSocket) {
        if (clients[uid] != null) {
            clients[uid] = clients[uid].filter((c) => c !== client);
            if (clients[uid].length === 0) {
                delete clients[uid];
            }
        }
    }

}
