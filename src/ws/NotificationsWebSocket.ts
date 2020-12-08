/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Feb 23 2020
*/

import { WSHandler } from "../lib/ws";
import { NotificationService } from "../services";

import { AuthenticatedWebSocket } from "./utils/AuthenticatedWebSocket";

@WSHandler("/v1/notifications")
export class NotificationsWebSocket extends AuthenticatedWebSocket {

    private uid: string;

    public async onAuthenticated() {
        const auth = this.auth!;
        if (auth.type === "user") {
            this.uid = auth.uid;
        }
        await this.checkAuthorized("notifications");
        await NotificationService.registerWsClient(this.uid, this);
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        await NotificationService.unregisterWsClient(this.uid, this);
    }

}
