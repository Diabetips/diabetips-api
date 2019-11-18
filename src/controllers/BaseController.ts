/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import bodyParser = require("body-parser");
import express = require("express");

export interface IControllerOptions {
    routerOptions?: express.RouterOptions;
    jsonParserOptions?: bodyParser.OptionsJson;
    formParserOptions?: bodyParser.OptionsUrlencoded;
}

export class BaseController {

    public router: express.Router;

    // Pre-configured middlewares
    protected formParser: express.RequestHandler;
    protected jsonParser: express.RequestHandler;

    constructor(options: IControllerOptions = {}) {
        this.router = express.Router(options.routerOptions);
        this.formParser = bodyParser.urlencoded(options.formParserOptions || {
            extended: true,
        });
        this.jsonParser = bodyParser.json(options.jsonParserOptions);
    }

}
