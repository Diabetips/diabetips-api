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

import { BaseService } from "./BaseService";

export class NotificationService extends BaseService {

    public static async getAllNotifications(uid: string, p: Pageable): Promise<Page<Notification>> {
        return Notification.findAll(uid, p);
    }

    public static async getAllUnreadNotifications(uid: string): Promise<Notification[]> {
        return Notification.findAllUnread(uid);
    }

    public static async markNotificationRead(uid: string, notifId: string) {
        const notif = await Notification.findById(uid, notifId);
        if (notif === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "notification_not_found", `Notification ${notifId} not found`);
        }
        notif.read = true;
        return notif.save();
    }

}
