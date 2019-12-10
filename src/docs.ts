/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 08 2019
*/

import { Request, Response } from "express";
import yaml = require("yaml");

import { Utils } from "./lib";

let cache: any;

function generateDocsSpec() {
    const baseSpec = Utils.loadYamlFile("docs/info.yml");

    cache = {
        ...baseSpec,
    };
}

export function getDocsSpec(req: Request, res: Response) {
    if (cache == null) {
        try {
            generateDocsSpec();
        } catch (ex) {
            res
                .status(500)
                .send();
        }
    }
    res.send(yaml.stringify(cache));
}
