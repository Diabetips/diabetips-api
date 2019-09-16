/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { ApiOperationGet, ApiOperationPost, ApiOperationPut, ApiPath, SwaggerDefinitionConstant, ApiOperationDelete } from "swagger-express-ts";
import { FoodController } from ".";
import { HttpStatus } from "../lib";
import { RecipeService } from "../services/RecipeService";
import { BaseController } from "./BaseController";

@ApiPath({
    path: "/recipe",
    name: "Recipes",
})
export class RecipeController extends BaseController {

    // TODO: remove that
    public static tmpSalad = {
        id: 0,
        name: "Salade de concombres",
        description: "hello this is a description",
        ingredients: [
            {
                ...FoodController.tmpCucumber,
                quantity: 150,
            },
            {
                ...FoodController.tmpCream,
                quantity: 200,
            },
        ],
    };

    constructor() {
        super();

        this.router
            .get("/", this.getAllRecipes)
            .post("/", this.jsonParser, this.createRecipe)
            .get("/:id", this.getRecipe)
            .put("/:id", this.jsonParser, this.updateRecipe)
            .delete("/:id", this.deleteRecipe);
    }

    @ApiOperationGet({
        summary: "Get a list of all recipes.",
        description: "Get a list of all the recipes available.<br>*Pageable*",
        responses: {
            200: {
                description: "A list of recipes",
                type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "Recipe",
            },
        },
        parameters: {
            query: {
                page: {
                    description: "The page number to access",
                    default: 0,
                    type: SwaggerDefinitionConstant.INTEGER,
                },
                name: {
                    description: "The name of the recipe (can be partial)",
                    type: SwaggerDefinitionConstant.STRING,
                },
                sort: {
                    description: "A collection of sort directives in the format `($propertyName,)+[asc|desc]`",
                    type: SwaggerDefinitionConstant.STRING,
                },
            },
        },
    })
    private async getAllRecipes(req: Request, res: Response) {
        // TODO: need pagination
        res.send(await RecipeService.getAllRecipes(req.query));
    }

    @ApiOperationGet({
        summary: "Get a recipe.",
        description: "Get the recipe with the specified ID.",
        responses: {
            200: {
                description: "A recipe",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "Food",
            },
            404: {
                description: "Recipe not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            path: {
                id: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async getRecipe(req: Request, res: Response) {
        res.send(await RecipeService.getRecipe(parseInt(req.params.id, 10)));
    }

    @ApiOperationPost({
        summary: "Create a recipe.",
        description: "Create a recipe with the given information.",
        responses: {
            200: {
                description: "Recipe successfully created.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "Recipe",
            },
            // TODO: failed to create recipe ?
        },
        parameters: {
            body: {
                description: "Body for a recipe",
                required: true,
                model: "Recipe",
            },
        },
    })
    private async createRecipe(req: Request, res: Response) {
        res.send(await RecipeService.createRecipe(req.body));
    }

    @ApiOperationPut({
        summary: "Update a recipe.",
        description: "Update a recipe with the given information.",
        responses: {
            200: {
                description: "Recipe successfully updated.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "Recipe",
            },
            404: {
                description: "Recipe not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            body: {
                description: "Body for a recipe",
                model: "Recipe",
            },
            path: {
                id: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async updateRecipe(req: Request, res: Response) {
        res.send(await RecipeService.updateRecipe(parseInt(req.params.id, 10), req.body));
    }

    @ApiOperationDelete({
        summary: "Delete a recipe.",
        description: "Remove a recipe from the database",
        responses: {
            200: {
                description: "Recipe successfully removed.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "Recipe",
            },
            404: {
                description: "Recipe not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            path: {
                id: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async deleteRecipe(req: Request, res: Response) {
        await RecipeService.deleteRecipe(parseInt(req.params.id, 10));
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }

}
