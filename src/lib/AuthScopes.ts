/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Jul 09 2020
*/

import { AuthInfo } from "./AuthInfo";

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
    | "special:support";

type AuthScopeInfo = {
    target: "app" | "user";
    checker?: (auth: AuthInfo | undefined, params: { [key: string]: string }) => Promise<void>;
    implicit?: boolean;
    restricted?: boolean;
};

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
    "user:delete":               { target: "user" },
    "user.apps:read":            { target: "user", restricted: true },
    "user.apps:write":           { target: "user", restricted: true },
    "user.biometrics:read":      { target: "user" }, // checker = (user == p || user in p.connections)
    "user.biometrics:write":     { target: "user" }, // checker = (user == p || user in p.connections)
    "user.connections:read":     { target: "user" },
    "user.connections:write":    { target: "user" },
    "user.meals:read":           { target: "user" }, // checker = (user == p || user in p.connections)
    "user.meals:write":          { target: "user" },
    "user.notes:read":           { target: "user" },
    "user.notes:write":          { target: "user" },
    "user.notifications":        { target: "user" },
    "user.predictions:new":      { target: "user" },
    "user.predictions:settings": { target: "user", restricted: true }, // checker = (user == p || user in p.connections)
    "user.profile:read":         { target: "user", implicit: true }, // checker = (user == p || user in p.connections)
    "user.profile:write":        { target: "user" },
    "special:admin":             { target: "user", implicit: true, restricted: true },
    "special:support":           { target: "user", implicit: true, restricted: true },
};
