/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Nov 18 2019
*/

import { Request, Response } from "express";
import { ApiOperationGet, ApiPath, SwaggerDefinitionConstant } from "swagger-express-ts";

import { BaseController } from "./BaseController";

const IMG_PLACEHOLDER = new Buffer("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC", "base64");

@ApiPath({
    path: "/v1/auth/apps",
    name: "OAuth Apps",
})
export class AuthAppLogoController extends BaseController {

    constructor() {
        super();

        this.router
            .get("/:appid/logo",       this.getAppLogo)
            .post("/:appid/logo",    this.uploadAppLogo);
    }

    @ApiOperationGet({
        path: "/{appid}/logo",
        summary: "Get an OAuth application logo",
        description: "Get the logo of an OAuth application",
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
                description: "The application's logo",
                type: "application/png",
            },
            404: {
                description: "Application not found",
                type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: "ApiError",
            },
        },
    })
    private async getAppLogo(req: Request, res: Response) {
        res
        .contentType("png")
        .send(IMG_PLACEHOLDER);
    }

    private async uploadAppLogo(req: Request, res: Response) {
        res
        .contentType("png")
        .send(IMG_PLACEHOLDER);
    }

}
