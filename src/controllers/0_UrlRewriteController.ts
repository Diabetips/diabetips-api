/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Feb 29 2020
*/

// Note: weird filename because routing-controllers import files in filename alphabetic order and routes in this need to
// run before everything else

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
        req.url = "/v1/users/" + UserService.getCurrentUser(context).uid + req.params[0];
        next("route");
    })
    private usersMeRewrite() {
        throw Error("Unreachable code");
    }

}
