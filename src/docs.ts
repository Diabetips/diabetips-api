/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 08 2019
*/

import { Request, Response } from "express";
import fs = require("fs");
import yaml = require("yaml");

import { config } from "./config";
import { Utils } from "./lib";

let cache: any;
let watches: fs.FSWatcher[] = [];

async function loadAndWatchYamlFile(filename: string) {
    let content: any;

    try {
        content = await Utils.loadYamlFile(filename);
    } catch (err) {
        err.message = filename + ": " + err.message;
        throw err;
    }

    if (config.env === "dev") {
        watches.push(fs.watch(filename, {
            persistent: false,
        }, () => {
            for (const watch of watches) {
                watch.close();
            }
            watches = [];
            cache = undefined;
        }));
    }

    return content;
}

async function generateDocsSpec() {
    const baseSpec = await loadAndWatchYamlFile("docs/base.yml");

    const pathSpecs: any = {};
    const componentSpecs: any = {};

    const componentCache = new Map<string, any>();

    async function resolveReferences(obj: any): Promise<any> {
        if (typeof(obj) === "object" && obj != null) {
            if (typeof(obj.$component) === "string") {
                const expr: string = obj.$component;
                const m = expr.match(/^(.*?):(.*?):([^/]*)(\/.*)?/);
                if (m == null) {
                    throw new Error("Invalid component import string");
                }
                const type = m[1];
                const file = m[2];
                const component = m[3];
                const subcomponent = m[4] || "";
                const path = `docs/components/${type}/${file}`;
                const componentPath = `${path}/${component}`;
                if (!componentCache.has(componentPath)) {
                    const newComponents = await loadAndWatchYamlFile(path);
                    for (const newComponent of Object.keys(newComponents)) {
                        const newComponentPath = `${path}/${newComponent}`;
                        componentCache.set(newComponentPath, await resolveReferences(newComponents[newComponent]));
                    }
                }
                if (!componentCache.has(componentPath)) {
                    throw new Error(`Imported file "${path}" does not contain requested component ${componentPath}`);
                }
                if (componentSpecs[type] === undefined) {
                    componentSpecs[type] = {};
                }
                if (componentSpecs[type][component] === undefined) {
                    componentSpecs[type][component] = componentCache.get(componentPath);
                }
                return {
                    $ref: `#/components/${type}/${component}` + subcomponent,
                };
            } else if (Array.isArray(obj)) {
                const resolved: any[] = [];
                for (const sub of obj) {
                    resolved.push(await resolveReferences(sub));
                }
                return resolved;
            } else {
                const resolved: any = {};
                for (const key of Object.keys(obj)) {
                    const sub = obj[key];
                    resolved[key] = await resolveReferences(sub);
                }
                return resolved;
            }
        }
        return obj;
    }

    for (const file of await Utils.readDir("docs/paths/")) {
        const paths = await loadAndWatchYamlFile(`docs/paths/${file}`);
        for (const path of Object.keys(paths)) {
            pathSpecs[path] = await resolveReferences(paths[path]);
        }
    }

    return {
        ...baseSpec,
        paths: {
            ...pathSpecs,
        },
        components: {
            ...componentSpecs,
        },
    };
}

export async function getDocsSpec(req: Request, res: Response) {
    if (cache == null) {
        cache = await generateDocsSpec();
    }
    res
        .type("yaml")
        .send(yaml.stringify(cache));
}
