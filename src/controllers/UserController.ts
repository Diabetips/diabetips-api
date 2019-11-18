/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import { NextFunction, Request, Response } from "express";

import { ApiOperationDelete, ApiOperationGet, ApiOperationPost, ApiOperationPut, 
    ApiPath, SwaggerDefinitionConstant } from "swagger-express-ts";
import { HttpStatus } from "../lib";
import { UserService } from "../services";

import { BaseController } from "./BaseController";

@ApiPath({
    path: "/users",
    name: "Users",
})
export class UserController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",                          this.getAllUsers)
            .post("/",        this.jsonParser, this.registerUser)
            .all(/\/me(\/.*)?/,                this.asCurrentUser)
            .get("/:uid",                      this.getUser)
            .put("/:uid",     this.jsonParser, this.updateUser)
            .delete("/:uid",                   this.deleteUser);
    }

    private asCurrentUser(req: Request, res: Response, next: NextFunction) {
        req.url = "/" + UserService.getCurrentUser(req.context).uid + req.url.slice(3);
        next("route");
    }

    @ApiOperationGet({
        summary: "Get a list of all users.",
        description: "Get a list of all the users the current authenticated user is allowed to see.<br>*Pageable*",
        responses: {
            200: {
                description: "A list of recipes",
                type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "User",
            },
        },
        parameters: {
            query: {
                page: {
                    description: "The page number to access",
                    default: 0,
                    type: SwaggerDefinitionConstant.INTEGER,
                },
                size: {
                    description: "The page size requested",
                    default: 0,
                    type: SwaggerDefinitionConstant.INTEGER,
                },
                sort: {
                    description: "A collection of sort directives in the format `($propertyName,)+[asc|desc]`",
                    type: SwaggerDefinitionConstant.STRING,
                },
            },
        },
    })
    private async getAllUsers(req: Request, res: Response) {
        res.send(await UserService.getAllUsers());
    }

    @ApiOperationPost({
        summary: "Register a new user",
        description: "Register a new user account using the supplied registration information.<br>"
        + "<h3>Validation</h3>"
        + "The following validation rules are applied on the registration data before creating the user:<br>"
        + "<ul>"
        + "<li>`email` must not be null or missing and must be a valid email address</li>"
        + "<li>`password` must not be null or missing and must be 8 characters or longer</li>"
        + "<li>`first_name` must not be blank, null or missing</li>"
        + "<li>`last_name` must not be blank, null or missing</li>"
        + "</ul>"
        + "The registration email must not be already used by another user account.",
        responses: {
            201: {
                description: "The created user account",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "User",
            },
            400: {
                description: "Parameters validation error",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
            409: {
                description: "Email address already used",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
            // TODO: failed to create recipe ?
        },
        parameters: {
            body: {
                description: "Body for a user registration",
                required: true,
                model: "UserPOST",
            },
        },
    })
    private async registerUser(req: Request, res: Response) {
        res.send(await UserService.registerUser(req.body));
    }

    @ApiOperationGet({
        summary: "Get a user.",
        description: "Get the user with the specified user ID",
        responses: {
            200: {
                description: "The user",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "User",
            },
            404: {
                description: "User not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{uid}",
        parameters: {
            path: {
                uid: {
                    description: "The user's UID",
                    required: true,
                },
            },
        },
    })
    private async getUser(req: Request, res: Response) {
        res.send(await UserService.getUser(req.params.uid));
    }

    @ApiOperationPut({
        summary: "Modify a user.",
        description: "Modify the user with the specified user ID<br>"
        + "The same validation rules as POST /users are applied on the user data",
        responses: {
            200: {
                description: "User successfully updated.",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "User",
            },
            400: {
                description: "Parameters validation error",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
            404: {
                description: "User not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
            409: {
                description: "Email address already used",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{uid}",
        parameters: {
            body: {
                description: "Body for a user",
                model: "UserPOST",
            },
            path: {
                uid: {
                    description: "The user's UID",
                    required: true,
                },
            },
        },
    })
    private async updateUser(req: Request, res: Response) {
        res.send(await UserService.updateUser(req.params.uid, req.body));
    }

    @ApiOperationDelete({
        summary: "Delete a user account.",
        description: "Mark a user account as deleted making it only visible to admins and support accounts",
        responses: {
            204: {
                description: "User deleted.",
            },
            404: {
                description: "User not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
        path: "/{uid}",
        parameters: {
            path: {
                uid: {
                    description: "The user's UID",
                    required: true,
                },
            },
        },
    })
    private async deleteUser(req: Request, res: Response) {
        await UserService.deleteUser(req.params.uid);
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
