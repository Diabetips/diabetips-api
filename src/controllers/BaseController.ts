/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Aug 30 2019
*/

import bodyParser = require("body-parser");
import express = require("express");

export interface IControllerOptions {
    routerOptions?: express.RouterOptions;
    formParserOptions?: bodyParser.OptionsUrlencoded;
    jsonParserOptions?: bodyParser.OptionsJson;
    rawParserOptions?: bodyParser.Options;
}

export class BaseController {

    public router: express.Router;

    // Pre-configured middlewares
    protected formParser: express.RequestHandler;
    protected jsonParser: express.RequestHandler;
    protected rawParser: express.RequestHandler;

    constructor(options: IControllerOptions = {}) {
        this.router = express.Router(options.routerOptions);
        this.formParser = bodyParser.urlencoded(options.formParserOptions || {
            extended: true,
        });
        this.jsonParser = bodyParser.json(options.jsonParserOptions);
        this.rawParser = bodyParser.raw(options.rawParserOptions);
    }

}
