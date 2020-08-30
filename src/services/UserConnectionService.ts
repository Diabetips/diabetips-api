/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 13 2019
*/

import uuid = require("uuid");

import { User, UserConnection } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { logger } from "../logger";
import { sendMail } from "../mail";
import { UserConnectionInviteReq } from "../requests";

import { BaseService } from "./BaseService";
import { NotificationService } from "./NotificationService";
import { UserService } from "./UserService";

export class UserConnectionService extends BaseService {

    public static async getAllUserConnections(uid: string): Promise<User[]> {
        const conns = await UserConnection.findAllByUid(uid);
        return conns.map((uc) => uc.source.uid === uid ? uc.target : uc.source);
    }

    public static async inviteUser(uid: string, req: UserConnectionInviteReq) {
        const user = await UserService.getUser(uid);
        const target = await User.findByEmail(req.email);
        if (target === undefined) {
            const invite = uuid.v4();

            const conn = new UserConnection();
            conn.source = user;
            conn.invite = invite;
            await conn.save();

            sendMail("invite-connection", user.lang, req.email, {
                first_name: user.first_name,
                last_name: user.last_name,
                invite,
            });
        } else if (user.uid === target.uid) {
            throw new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, "forever_alone", "User cannot invite themselves");
        } else {
            const conn = new UserConnection();
            conn.source = user;
            conn.target = target;
            await conn.save();

            await NotificationService.sendNotification(target, "user_invite", {
                from: user.uid,
            });
        }
    }

    public static async deleteUserConnection(uid: string, connectionUid: string) {
        const conn = await UserConnection.findByUids(uid, connectionUid);
        if (conn == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `Connection ${connectionUid} not found`);
        }
        await conn.remove();
    }

    public static async completeUserInvite(invite: string, user: User) {
        const conn = await UserConnection.findByInvite(invite);
        if (!conn) {
            logger.warn(`Invite code ${invite} not found`);
            return;
        }

        conn.target = user;
        conn.invite = null;
        conn.accepted = true;
        await conn.save();
    }

}
