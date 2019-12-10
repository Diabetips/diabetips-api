/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Nov 13 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    description: "Model to create an ingredient",
    name: "IngredientPOST",
})
export class IngredientPost {
    @ApiModelProperty({
        description: "Quantity of the ingredient in the recipe",
        example: "200",
    })
    public quantity: number;

    // Necessary for documentation purposes
    @ApiModelProperty({
        description: "ID of the food",
        example: 3,
    })
    public foodID: number;
}
