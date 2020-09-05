/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { AuthInfo, UserAuthInfo } from "./AuthInfo";

export interface Context {
    auth?: AuthInfo;
}

export interface UserContext extends Context {
    auth: UserAuthInfo;
}
