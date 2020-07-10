/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { AuthApp } from "../entities";

export interface AppAuthInfo {
    type: "app";
    app: AuthApp;
}

export interface UserAuthInfo {
    type: "user";
    uid: string;
    clientId: string;
}

export type AuthInfo = AppAuthInfo | UserAuthInfo;
