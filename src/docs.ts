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
    const content = await Utils.loadYamlFile(filename);

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

    const componentFilesCache = new Map<string, any>();

    async function resolveReferences(obj: any): Promise<any> {
        if (typeof(obj) === "object") {
            if (typeof(obj.$ref) === "string") {
                const ref: string = obj.$ref;
                if (ref.startsWith("!")) {
                    const m = ref.match(/^!(.*?):(.*?):([^/]*)(\/.*)?/);
                    if (m == null) {
                        throw new Error("Invalid import reference string");
                    }
                    const type = m[1];
                    const file = m[2];
                    const component = m[3];
                    const subcomponent = m[4] || "";
                    const path = `docs/components/${type}/${file}`;
                    if (!componentFilesCache.has(path)) {
                        componentFilesCache.set(path,
                            await resolveReferences(await loadAndWatchYamlFile(path)));
                    }
                    if (componentSpecs[type] === undefined) {
                        componentSpecs[type] = {};
                    }
                    if (componentSpecs[type][component] === undefined) {
                        componentSpecs[type][component] = componentFilesCache.get(path)[component];
                    }
                    return {
                        $ref: `#/components/${type}/${component}` + subcomponent,
                    };
                }
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
