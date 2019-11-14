/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Nov 13 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    description: "Model for a reset password request",
    name: "ResetPasswordModel",
})
export class ResetPasswordModel {
    @ApiModelProperty({
        description: "Email of the account",
        example: "user@example.com",
    })
    public email: string;
}