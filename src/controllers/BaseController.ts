/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import bodyParser = require("body-parser");
import express = require("express");

import { ApiError, HttpStatus } from "../lib";

export { ApiError, HttpStatus };

export interface IControllerOptions {
    routerOptions?: express.RouterOptions;
    jsonParserOptions?: bodyParser.OptionsJson;
    formParserOptions?: bodyParser.OptionsUrlencoded;
}

export class BaseController {

    public router: express.Router;

    // Pre-configured middlewares
    public formParser: express.RequestHandler;
    public jsonParser: express.RequestHandler;

    constructor(options: IControllerOptions = {}) {
        this.router = express.Router(options.routerOptions);
        this.formParser = bodyParser.urlencoded(options.formParserOptions || {
            extended: true,
        });
        this.jsonParser = bodyParser.json(options.jsonParserOptions);
    }

}
