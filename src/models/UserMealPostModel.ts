/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Nov 13 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    description: "Model to create a User meal",
    name: "UserMealPOST",
})
export class UserMealPost {
    @ApiModelProperty({
        description: "Description of the meal set by the user.",
        example: "Lunch on the 7th of March",
    })
    public description: string;

    @ApiModelProperty({
        description: "List of the recipe ID's in the meal",
        example: [4, 2],
    })
    public recipeIDs: number[];
}
