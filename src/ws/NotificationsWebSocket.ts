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

@WSHandler("/v1/users/:uid/notifications")
export class NotificationsWebSocket extends AuthenticatedWebSocket {

    public async onAuthenticated() {
        const auth = this.auth!;
        if (auth!.type === "user" && this.params.uid === "me") {
            this.params.uid = auth.uid;
        }
        await this.checkAuthorized("notifications");
        await NotificationService.registerWsClient(this.params.uid, this);
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        await NotificationService.unregisterWsClient(this.params.uid, this);
    }

}
