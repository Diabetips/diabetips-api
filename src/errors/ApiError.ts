/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { HttpStatus } from "../lib";

@ApiModel({
    description: "Model for an APIError object",
    name: "ApiError",
})
export class ApiError extends Error {

    @ApiModelProperty({ example: "example_error" })
    public error: string;

    @ApiModelProperty({ example: "Error description message" })
    public message: string;

    constructor(public status: HttpStatus,
        error: string,
        message: string) {
        super(message);
        this.error = error;
    }

}
