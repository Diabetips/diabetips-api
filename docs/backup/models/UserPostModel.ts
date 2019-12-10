/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Nov 13 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    description: "Model to register a user",
    name: "UserPOST",
})
export class UserPost {
    @ApiModelProperty({
        description: "Users's email",
        example: "user@example.com",
    })
    public email: string;

    @ApiModelProperty({
        description: "User's password",
        example: "password123",
    })
    private password: string;

    @ApiModelProperty({
        description: "Users's first name",
        example: "John",
    })
    public first_name: string;

    @ApiModelProperty({
        description: "Users's first name",
        example: "Snow",
    })
    public last_name: string;
}
