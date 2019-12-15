/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Oct 13 2019
*/

import { User } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { sendMail } from "../mail";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export interface CreateUserConnectionReq {
    email: string;
}

export class UserConnectionService extends BaseService {

    public static async getAllUserConnections(uid: string): Promise<User[]> {
        // TODO
        // * pagination
        return (await UserService.getUser(uid)).connections;
    }

    public static async createUserConnection(uid: string, req: CreateUserConnectionReq) {
        const user = await UserService.getUser(uid);
        const target = await User.findByEmail(req.email);
        if (target === undefined) {
            sendMail("invite-connection", user.lang, req.email, {
                first_name: user.first_name,
                last_name: user.last_name,
            });
        } else {
            await this.addConnection(user, target);
            await this.addConnection(target, user);
        }
    }

    public static async deleteUserConnection(uid: string, connectionUid: string) {
        const user = await UserService.getUser(uid);
        const connections = await user.connections;
        const target = connections.find((val) => val.uid === connectionUid);
        if (target == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `Connection ${connectionUid} not found`);
        }
        await this.removeConnection(user, target);
        await this.removeConnection(target, user);
    }

    private static async addConnection(source: User, target: User) {
        const connections = await source.connections;
        if (connections.find((val) => val.uid === target.uid) != null) {
            return;
        }
        source.connections = Promise.resolve(connections.concat(target));
        await source.save();
    }

    private static async removeConnection(source: User, target: User) {
        const connections = await source.connections;
        source.connections = Promise.resolve(connections.filter((val) => val.uid !== target.uid));
        await source.save();
    }
}
