/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { User } from "../entities";

export interface AppAuthInfo {
    type: "app";
    clientId: string;
}

export interface UserAuthInfo {
    type: "user";
    uid: string;
}

export type AuthInfo = AppAuthInfo | UserAuthInfo;
