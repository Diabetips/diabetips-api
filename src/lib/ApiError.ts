/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { HttpStatus } from "./HttpStatus";

export class ApiError extends Error {

    constructor(public status: HttpStatus,
                public error: string,
                message: string) {
        super(message);
    }

}
