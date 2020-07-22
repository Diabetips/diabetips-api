/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { AuthApp } from "../entities";

import { AuthScope } from "./AuthScopes";

export interface AppAuthInfo {
    type: "app";
    app: AuthApp;
}

export interface UserAuthInfo {
    type: "user";
    uid: string;
    appid: string;
    scopes: AuthScope[];
}

export type AuthInfo = AppAuthInfo | UserAuthInfo;
