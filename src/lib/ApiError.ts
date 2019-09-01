/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { HttpStatus } from "./HttpStatus";

export class ApiError extends Error {

    // Common API error
    public static MISSING_BODY = () => new ApiError(HttpStatus.BAD_REQUEST, "Missing body in request");

    constructor(public status: HttpStatus, message: string) {
        super(message);
    }

}
