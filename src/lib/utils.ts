/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Tue Sep 03 2019
*/

import fs = require("fs");

export function guard<T>(fn: () => T, def: T): T {
    try {
        return fn();
    } catch (err) {
        return def;
    }
}

export function jsonReplacer(key: string, value: any): any {
    if (key.startsWith("_")) {
        return undefined;
    }
    return value;
}

export function loadJsonFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
}

export function merge(obj1: any, obj2: any): any {
    const res = { ...obj1 };
    for (const prop of Object.getOwnPropertyNames(obj2)) {
        const value = obj2[prop];
        res[prop] = (obj1[prop] !== undefined && typeof value === "object")
            ? merge(obj1[prop], value)
            : value;
    }
    return res;
}
