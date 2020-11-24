/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Nov 24 2020
*/

import { WSHandler } from "../lib/ws";
import { ChatService } from "../services";

import { AuthenticatedWebSocket } from "./utils/AuthenticatedWebSocket";

@WSHandler("/v1/chat")
export class ChatWebSocket extends AuthenticatedWebSocket {

    private uid: string;

    public async onAuthenticated() {
        const auth = this.auth!;
        if (auth.type === "user") {
            this.uid = auth.uid;
        }
        await this.checkAuthorized("chat");
        await ChatService.registerWsClient(this.uid, this);
    }

    public async onDisconnect(code: number, reason: string) {
        super.onDisconnect(code, reason);
        await ChatService.unregisterWsClient(this.uid, this);
    }

}
