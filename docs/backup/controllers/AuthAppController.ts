/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Oct 14 2019
*/

import { Request, Response } from "express";
import { ApiOperationGet, ApiPath, SwaggerDefinitionConstant } from "swagger-express-ts";

import { AuthAppService } from "../services";

import { BaseController } from "./BaseController";

@ApiPath({
    path: "/v1/auth/apps",
    name: "OAuth Apps",
})
export class AuthAppController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/",          this.getAllApps)
            .get("/:appid",    this.getApp);
    }

    @ApiOperationGet({
        summary: "Get a list of all OAuth applications",
        description: "Get a list of all the OAuth applications registered on the API",
        responses: {
            200: {
                description: "A list of applications",
                type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "AuthApp",
            },
        },
    })
    private async getAllApps(req: Request, res: Response) {
        res.send(await AuthAppService.getAllApps());
    }

    @ApiOperationGet({
        path: "/{appid}",
        summary: "Get an OAuth application info",
        description: "Get information on an OAuth application",
        parameters: {
            path: {
                appid: {
                    description: "The application ID",
                    required: true,
                },
            },
        },
        responses: {
            200: {
                description: "A list of applications",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "AuthApp",
            },
            404: {
                description: "Application not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
    })
    private async getApp(req: Request, res: Response) {
        res.send(await AuthAppService.getApp(req.params.appid));
    }

}
