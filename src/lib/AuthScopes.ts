/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jul 09 2020
*/

import { Brackets } from "typeorm";

import { UserConnection } from "../entities";
import { ApiError } from "../errors";

import { AuthInfo } from "./AuthInfo";
import { HttpStatus } from "./HttpStatus";
import { Utils } from "./Utils";

export type AuthScope = "auth:authorize"
    | "auth:confirm"
    | "auth:reset"
    | "auth:reset2"
    | "apps:read"
    | "apps:write"
    | "biometrics:read"
    | "biometrics:write"
    | "chat"
    | "connections:read"
    | "connections:write"
    | "connections:invite"
    | "dev_apps:read"
    | "dev_apps:write"
    | "food"
    | "meals:read"
    | "meals:write"
    | "notes:read"
    | "notes:write"
    | "notifications"
    | "predictions:new"
    | "predictions:settings"
    | "profile:read"
    | "profile:write"
    | "recipe:read"
    | "recipe:write"
    | "user:create"
    | "user:delete"
    | "special:admin"
    | "special:diaby"
    | "special:support";

type AuthChecker = (auth: AuthInfo, params: { [key: string]: string }) => Promise<void>;

type AuthScopeInfo = {
    target: "app" | "user";
    implicit?: boolean;
    restricted?: boolean;
    checker?: AuthChecker;
};

interface UserCheckerOptions {
    direct?: boolean; // allows principal to see itself, default true
    extend?: boolean; // allows principal to see users that they are connected to, default false
    extendBidirectional?: boolean; // allows principal to see users that are connected to them, default false
    extendUnaccepted?: boolean; // allows principal to see users that sent them a connection invite, default false
}

function userChecker(options: UserCheckerOptions = {}): AuthChecker {
    return async (auth: AuthInfo, params: { [key: string ]: string}) => {
        if (auth.type !== "user") {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide user authorization");
        }
        if (typeof params.uid !== "string") {
            throw new Error("UID parameter not found");
        }

        const principal = auth.uid;
        const target = params.uid;

        if (Utils.optionDefault(options.direct, true) && principal === target) {
            return;
        }
        if (Utils.optionDefault(options.extend, false)) {
            let qb = UserConnection
                .createQueryBuilder("conn")
                .leftJoin("conn.source", "source")
                .leftJoin("conn.target", "target")
                .where(new Brackets((bqb) => {
                    bqb = bqb.where(new Brackets((sbqb) => {
                        return sbqb
                            .where("source.uid = :principal")
                            .andWhere("target.uid = :target");
                    }))

                    if (Utils.optionDefault(options.extendBidirectional, false)) {
                        bqb = bqb.orWhere(new Brackets((sbqb) => {
                            return sbqb
                                .where("source.uid = :target")
                                .andWhere("target.uid = :principal");
                        }));
                    }

                    return bqb;
                }));

            qb = qb.andWhere(new Brackets((bqb) => {
                bqb = bqb.where("conn.accepted = true");

                if (Utils.optionDefault(options.extendBidirectional, false) &&
                    Utils.optionDefault(options.extendUnaccepted, false)) {
                    bqb.orWhere("target.uid = :principal");
                }

                return bqb;
            }));

            qb.setParameters({
                principal,
                target,
            });

            if (await qb.getCount() >= 1) {
                return;
            }
        }
        throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${target} not found`);
    };
}

function chatChecker(): AuthChecker {
    const userCheck = userChecker({
        direct: false,
        extend: true,
        extendBidirectional: true,
    });

    return async (auth: AuthInfo, params: { [key: string]: string }) => {
        if (auth.type !== "user") {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide user authorization");
        }

        if (typeof params.uid !== "string") {
            return;
        }

        return userCheck(auth, params);
    };
}

export const AuthScopes: Record<AuthScope, AuthScopeInfo> = {
    "auth:authorize":            { target: "user", restricted: true },
    "auth:confirm":              { target: "app",  restricted: true },
    "auth:reset":                { target: "app",  restricted: true },
    "auth:reset2":               { target: "app",  restricted: true },
    "apps:read":                 { target: "user", restricted: true, checker: userChecker() },
    "apps:write":                { target: "user", restricted: true, checker: userChecker() },
    "biometrics:read":           { target: "user", checker: userChecker({ extend: true }) },
    "biometrics:write":          { target: "user", checker: userChecker({ extend: true }) },
    "chat":                      { target: "user", checker: chatChecker() },
    "connections:read":          { target: "user", checker: userChecker() },
    "connections:write":         { target: "user", checker: userChecker() },
    "connections:invite":        { target: "user", restricted: true, checker: userChecker() },
    "dev_apps:read":             { target: "user", restricted: true }, // checker = (p == app.owner)
    "dev_apps:write":            { target: "user", restricted: true }, // checker = (p == app.owner)
    "food":                      { target: "app" },
    "meals:read":                { target: "user", checker: userChecker({ extend: true }) },
    "meals:write":               { target: "user", checker: userChecker() },
    "notes:read":                { target: "user", checker: userChecker() },
    "notes:write":               { target: "user", checker: userChecker() },
    "notifications":             { target: "user" },
    "predictions:new":           { target: "user", checker: userChecker() },
    "predictions:settings":      { target: "user", restricted: true, checker: userChecker({ direct: false, extend: true }) },
    "profile:read":              { target: "user", implicit: true, checker: userChecker({ extend: true, extendBidirectional: true, extendUnaccepted: true }) },
    "profile:write":             { target: "user", checker: userChecker() },
    "recipe:read":               { target: "user" },
    "recipe:write":              { target: "user" },
    "user:create":               { target: "app",  restricted: true },
    "user:delete":               { target: "user", restricted: true, checker: userChecker() },
    "special:admin":             { target: "user", restricted: true },
    "special:support":           { target: "user", restricted: true },
    "special:diaby":             { target: "app",  restricted: true },
};
