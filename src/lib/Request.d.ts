/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 07 2019
*/

import { Context } from "./Context";

// Patch Request object to add context
declare global {
    namespace Express {
        interface Request {
            context: Context;
        }
    }
};
