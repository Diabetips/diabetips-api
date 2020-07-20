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

export type AuthScope = "app:read"
    | "app:write"
    | "auth:authorize"
    | "auth:confirm"
    | "auth:reset"
    | "auth:reset2"
    | "food:read"
    | "recipe:read"
    | "recipe:write"
    | "user:create"
    | "user:delete"
    | "user.apps:read"
    | "user.apps:write"
    | "user.biometrics:read"
    | "user.biometrics:write"
    | "user.connections:read"
    | "user.connections:write"
    | "user.meals:read"
    | "user.meals:write"
    | "user.notes:read"
    | "user.notes:write"
    | "user.notifications"
    | "user.predictions:new"
    | "user.predictions:settings"
    | "user.profile:read"
    | "user.profile:write"
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
    "app:read":                  { target: "user", restricted: true }, // checker = (p == app.owner)
    "app:write":                 { target: "user", restricted: true }, // checker = (p == app.owner)
    "auth:authorize":            { target: "app", restricted: true },
    "auth:confirm":              { target: "app", restricted: true },
    "auth:reset":                { target: "app" },
    "auth:reset2":               { target: "app", restricted: true },
    "food:read":                 { target: "app" },
    "recipe:read":               { target: "user" },
    "recipe:write":              { target: "user" },
    "user:create":               { target: "app" },
    "user:delete":               { target: "user", checker: userChecker() },
    "user.apps:read":            { target: "user", restricted: true, checker: userChecker() },
    "user.apps:write":           { target: "user", restricted: true, checker: userChecker() },
    "user.biometrics:read":      { target: "user", checker: userChecker({ extendToConnections: true }) },
    "user.biometrics:write":     { target: "user", checker: userChecker({ extendToConnections: true }) },
    "user.connections:read":     { target: "user", checker: userChecker() },
    "user.connections:write":    { target: "user", checker: userChecker() },
    "user.meals:read":           { target: "user", checker: userChecker({ extendToConnections: true }) },
    "user.meals:write":          { target: "user", checker: userChecker() },
    "user.notes:read":           { target: "user", checker: userChecker() },
    "user.notes:write":          { target: "user", checker: userChecker() },
    "user.notifications":        { target: "user", checker: userChecker() },
    "user.predictions:new":      { target: "user", checker: userChecker() },
    "user.predictions:settings": { target: "user", restricted: true, checker: userChecker({ direct: false, extendToConnections: true }) },
    "user.profile:read":         { target: "user", implicit: true, checker: userChecker({ extendToConnections: true }) },
    "user.profile:write":        { target: "user", checker: userChecker() },
    "special:admin":             { target: "user", implicit: true, restricted: true },
    "special:diaby":             { target: "app", restricted: true },
    "special:support":           { target: "user", implicit: true, restricted: true },
};
