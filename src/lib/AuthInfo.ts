/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { User } from "../entities";

interface AppAuthInfo {
    type: "app";
    clientId: string;
}

interface UserAuthInfo {
    type: "user";
    user: User;
}

export type AuthInfo = AppAuthInfo | UserAuthInfo;
