/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Feb 29 2020
*/

// Note: this file has a filename prefix because routing-controllers imports files in this directory in the alphabetic
// order and routes in this file should run before everything else

import { NextFunction, Request, Response } from "express";
import { All, Controller, UseBefore } from "routing-controllers";

import { Context } from "../lib";
import { AuthService, UserService } from "../services";

@Controller()
export class UrlRewriteController {

    @All(/^\/v1\/users\/me(\/.*)?/)
    @UseBefore(async (req: Request, res: Response, next: NextFunction) => {
        const context: Context = {
            auth: await AuthService.decodeAuthorization(req.header("Authorization")),
        };
        req.url = "/v1/users/" + UserService.getCurrentUser(context).uid + (req.params[0] || "");
        next("route");
    })
    public usersMeRewrite() {
        throw Error("Unreachable code");
    }

}
