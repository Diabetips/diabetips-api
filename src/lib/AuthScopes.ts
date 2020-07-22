/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jul 09 2020
*/

import { ApiError } from "../errors";

import { AuthInfo } from "./AuthInfo";
import { HttpStatus } from "./HttpStatus";
import { Utils } from "./Utils";
import { User } from "../entities";

export type AuthScope = "auth:authorize"
    | "auth:confirm"
    | "auth:reset"
    | "auth:reset2"
    | "apps:read"
    | "apps:write"
    | "biometrics:read"
    | "biometrics:write"
    | "connections:read"
    | "connections:write"
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

type AuthChecker = (auth: AuthInfo | undefined, params: { [key: string]: string }) => Promise<void>;

type AuthScopeInfo = {
    target: "app" | "user";
    implicit?: boolean;
    restricted?: boolean;
    checker?: AuthChecker;
};

interface UserCheckerOptions {
    direct?: boolean; // default true
    extendToConnections?: boolean; // default false
}

function userChecker(options: UserCheckerOptions = {}): AuthChecker {
    return async (auth: AuthInfo | undefined, params: { [key: string ]: string}) => {
        if (auth?.type !== "user") {
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
        if (Utils.optionDefault(options.extendToConnections, false)) {
            const qb = User
                .createQueryBuilder("user")
                .innerJoin("user.connections", "conn")
                .where("user.uid = :uid", { uid: principal })
                .andWhere("conn.uid = :uid2", { uid2: target });
            if (await qb.getCount() === 1) {
                return;
            }
        }
        throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User ${target} not found`);
    };
}

export const AuthScopes: { [key in AuthScope]: AuthScopeInfo } = {
    "auth:authorize":            { target: "app",  restricted: true },
    "auth:confirm":              { target: "app",  restricted: true },
    "auth:reset":                { target: "app" },
    "auth:reset2":               { target: "app",  restricted: true },
    "apps:read":                 { target: "user", restricted: true, checker: userChecker() },
    "apps:write":                { target: "user", restricted: true, checker: userChecker() },
    "biometrics:read":           { target: "user", checker: userChecker({ extendToConnections: true }) },
    "biometrics:write":          { target: "user", checker: userChecker({ extendToConnections: true }) },
    "connections:read":          { target: "user", checker: userChecker() },
    "connections:write":         { target: "user", restricted: true, checker: userChecker() },
    "dev_apps:read":             { target: "user", restricted: true }, // checker = (p == app.owner)
    "dev_apps:write":            { target: "user", restricted: true }, // checker = (p == app.owner)
    "food":                      { target: "app" },
    "meals:read":                { target: "user", checker: userChecker({ extendToConnections: true }) },
    "meals:write":               { target: "user", checker: userChecker() },
    "notes:read":                { target: "user", checker: userChecker() },
    "notes:write":               { target: "user", checker: userChecker() },
    "notifications":             { target: "user", checker: userChecker() },
    "predictions:new":           { target: "user", checker: userChecker() },
    "predictions:settings":      { target: "user", restricted: true, checker: userChecker({ direct: false, extendToConnections: true }) },
    "profile:read":              { target: "user", implicit: true, checker: userChecker({ extendToConnections: true }) },
    "profile:write":             { target: "user", checker: userChecker() },
    "recipe:read":               { target: "user" },
    "recipe:write":              { target: "user" },
    "user:create":               { target: "app",  restricted: true },
    "user:delete":               { target: "user", restricted: true, checker: userChecker() },
    "special:admin":             { target: "user", implicit: true, restricted: true },
    "special:diaby":             { target: "app",  restricted: true },
    "special:support":           { target: "user", implicit: true, restricted: true },
};
