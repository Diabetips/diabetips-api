/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Nov 13 2019
*/

import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { Ingredient } from "../entities/Ingredient";

@ApiModel({
    description: "Model to create a recipe.",
    name: "RecipePOST",
})
export class RecipePostModel {
        @ApiModelProperty({
            description: "Name of the recipe",
            example: "Lasagna",
        })
        public name: string;

        @ApiModelProperty({
            description: "Description of the recipe",
            example: "Lasagnas are a delicious and cheap italian dish.",
        })
        public description: string;

        @ApiModelProperty({
            description: "Ingredients of the recipe",
            model: "IngredientPOST",
        })
        public ingredients: Ingredient[];
}
