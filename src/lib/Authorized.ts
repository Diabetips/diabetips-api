/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jul 19 2020
*/

import { Authorized as RoutingControllerAuthorized } from "routing-controllers";

import { AuthScope } from "./AuthScopes";

// Convenient wrapper for scope type checking
export function Authorized(...scopes: AuthScope[]): Function {
    return RoutingControllerAuthorized(scopes);
}
