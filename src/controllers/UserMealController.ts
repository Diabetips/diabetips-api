/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";

import { ApiOperationGet, ApiOperationPost, ApiOperationPut, ApiPath, SwaggerDefinitionConstant, ApiOperationDelete } from "swagger-express-ts";
import { HttpStatus } from "../lib";
import { UserMealService } from "../services/UserMealService";
import { BaseController } from "./BaseController";

@ApiPath({
    path: "/users/{userUid}/meals",
    name: "UserMeals",
})
export class UserMealController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:userUid/meals/", this.getAllUserMeals)
            .post("/:userUid/meals/", this.addUserMeal)
            .get("/:userUid/meals/:id", this.getUserMeal)
            .put("/:userUid/meals/:id", this.updateUserMeal)
            .delete("/:userUid/meals/:id", this.deleteUserMeal);
    }

    @ApiOperationGet({
        summary: "Get a list of all the user's meals.",
        description: "Get a list of all the user's meals.<br>*Pageable*",
        responses: {
            200: {
                description: "A list of meals",
                type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "UserMeal",
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
                    description: "The name of the meal (can be partial)",
                    type: SwaggerDefinitionConstant.STRING,
                },
                sort: {
                    description: "A collection of sort directives in the format `($propertyName,)+[asc|desc]`",
                    type: SwaggerDefinitionConstant.STRING,
                },
            },
            path: {
                userUid: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async getAllUserMeals(req: Request, res: Response) {
        res.send(await UserMealService.getAllUserMeals(req.params.useruid, req.query));
    }

    @ApiOperationGet({
        summary: "Get a user's meal.",
        description: "Get the meal with the specified ID.",
        responses: {
            200: {
                description: "A meal",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "UserMeal",
            },
            404: {
                description: "Recipe not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            path: {
                userUid: {
                    description: "The recipe's ID",
                    required: true,
                },
                id: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async getUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        res.send(await UserMealService.getUserMeal(params));
    }

    @ApiOperationPost({
        summary: "Create a meal.",
        description: "Create a meal with the given information.",
        responses: {
            200: {
                description: "Meal successfully created.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "UserMeal",
            },
            // TODO: failed to create meal ?
        },
        parameters: {
            body: {
                description: "Body for a meal",
                required: true,
                model: "UserMeal",
            },
            path: {
                userUid: {
                    description: "The recipe's ID",
                    required: true,
                },
            },
        },
    })
    private async addUserMeal(req: Request, res: Response) {
        res.send(await UserMealService.addUserMeal(req.params.useruid, req.body));
    }

    @ApiOperationPut({
        summary: "Update a meal.",
        description: "Update a meal with the given information.",
        responses: {
            200: {
                description: "Meal successfully updated.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "UserMeal",
            },
            404: {
                description: "Meal not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            body: {
                description: "Body for a meal",
                model: "UserMeal",
            },
            path: {
                userUid: {
                    description: "The recipe's ID",
                    required: true,
                },
                id: {
                    description: "The Meal's ID",
                    required: true,
                },
            },
        },
    })
    private async updateUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        res.send(await UserMealService.updateUserMeal(params, req.body));
    }

    @ApiOperationDelete({
        summary: "Delete a meal.",
        description: "Remove a meal from the database",
        responses: {
            200: {
                description: "Meal successfully removed.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "UserMeal",
            },
            404: {
                description: "Meal not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            path: {
                userUid: {
                    description: "The recipe's ID",
                    required: true,
                },
                id: {
                    description: "The meal's ID",
                    required: true,
                },
            },
        },
    })
    private async deleteUserMeal(req: Request, res: Response) {
        const params = {
            userUid: req.params.userUid,
            mealId: parseInt(req.params.mealId, 10),
        };

        await UserMealService.deleteUserMeal(params);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
