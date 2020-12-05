/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Nov 28 2020
*/

import express = require("express");
import prometheus = require("prom-client");
import { BaseEntity } from "typeorm";

import * as entities from "./entities";

export const metricsApp = express();

export const registry = new prometheus.Registry();
export const registryDb = new prometheus.Registry();

prometheus.collectDefaultMetrics({
    register: registry,
});

metricsApp.get("/metrics", async (req, res) => {
    res.send(await registry.metrics());
});

metricsApp.get("/metricsdb", async (req, res) => {
    res.send(await registryDb.metrics());
});

function addEntityGauge(entity: typeof BaseEntity, options: prometheus.GaugeConfiguration<string>) {
    const gauge = new prometheus.Gauge({
        ...options,
        registers: [registryDb],
        collect: async () => {
            gauge.set(await entity.count());
        },
    });
    return gauge;
}

addEntityGauge(entities.User, {
    name: "db_users_count",
    help: "Number of users in the database",
});
