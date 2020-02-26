/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Feb 21 2020
*/

import { HttpStatus } from "../lib";

import { ApiError } from "./ApiError";

export class ValidationError extends ApiError {

    public errors: any;

    constructor(validatorError: any) {
        super(HttpStatus.BAD_REQUEST, "validation_error", "Validation rules violated");
        this.errors = validatorError.errors;
    }

}
