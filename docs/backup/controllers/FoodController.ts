/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Sep 02 2019
*/

import { Request, Response } from "express";
import { ApiOperationGet, ApiPath, SwaggerDefinitionConstant } from "swagger-express-ts";
import { FoodService } from "../services/FoodService";
import { BaseController } from "./BaseController";

@ApiPath({
    path: "/food",
    name: "Food",
})
export class FoodController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/", this.getAllFood)
            .get("/:id", this.getFood)
            // TODO: Remove temporary route
            .post("/", this.jsonParser, this.addFood);
    }

    @ApiOperationGet({
        summary: "Get a list of all foods",
        description: "Get a list of all foods available.<br>*Pageable*",
        responses: {
            200: {
                description: "A list of food",
                type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "Food",
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
                    description: "The name of the food (can be partial)",
                    type: SwaggerDefinitionConstant.STRING,
                },
                sort: {
                    description: "A collection of sort directives in the format `($propertyName,)+[asc|desc]`",
                    type: SwaggerDefinitionConstant.STRING,
                },
            },
        },
    })
    private async getAllFood(req: Request, res: Response) {
        // TODO: Need pagination
        res.send(await FoodService.getAllFood(req.query));
    }

    @ApiOperationGet({
        summary: "Get a food",
        description: "Get the food with the specified ID.",
        responses: {
            200: {
                description: "A food",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "Food",
            },
            404: {
                description: "Food not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{id}",
        parameters: {
            path: {
                id: {
                    description: "The food's ID",
                    required: true,
                },
            },
        },
    })
    private async getFood(req: Request, res: Response) {
        res.send(await FoodService.getFood(parseInt(req.params.id, 10)));
    }

    private async addFood(req: Request, res: Response) {
        res.send(await FoodService.addFood(req.body));
    }
}
