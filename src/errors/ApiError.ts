/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { HttpStatus } from "../lib";

export class ApiError extends Error {

    public error: string;

    public message: string;

    constructor(public status: HttpStatus,
                error: string,
                message: string) {
        super(message);
        this.error = error;
    }

}
