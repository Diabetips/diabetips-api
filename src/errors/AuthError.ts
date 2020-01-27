/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Sep 12 2019
*/

export class AuthError extends Error {

    constructor(public error: string,
                public description: string) {
        super(description);
    }

}
