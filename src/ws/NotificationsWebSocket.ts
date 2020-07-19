/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Feb 23 2020
*/

import { AuthInfo } from "../lib";
import { WSHandler } from "../lib/ws";
import { NotificationService } from "../services";

import { AuthenticatedWebSocket } from "./utils/AuthenticatedWebSocket";

@WSHandler("/v1/users/:uid/notifications")
export class NotificationsWebSocket extends AuthenticatedWebSocket {

    public async onAuthenticated(auth: AuthInfo) {
        if (auth.type === "user" && this.params.uid === "me") {
            this.params.uid = auth.uid;
        }
        // TODO check authorized
        await NotificationService.registerWsClient(this.params.uid, this);
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        await NotificationService.unregisterWsClient(this.params.uid, this);
    }

}
