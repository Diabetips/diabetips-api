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

import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { AuthService } from "../services";

// Annotated RegExp type to pretty print route
type RouteRegExp = RegExp & { _str?: string };
function makeRouteRegExp(re: RegExp, str: string): RouteRegExp {
    const res: RouteRegExp = re;
    res._str = str;
    return res;
}

@Controller()
export class UrlRewriteController {

    @All(makeRouteRegExp(/^\/v1\/users\/me(\/.*)?/, "/v1/users/me"))
    @UseBefore(async (req: Request, res: Response, next: NextFunction) => {
        const auth = await AuthService.authFromRequest(req);
        if (auth == null) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token");
        }
        if (auth.type !== "user") {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_request", "This route is only available with a user authorization token");
        }
        req.url = "/v1/users/" + auth.uid + (req.params[0] || "");
        // Patch my own patch lmao fuck this
        (req as any).routingControllersStarted = false;
        return next("route");
    })
    public usersMeRewrite() {
        throw Error("Unreachable code");
    }

}
