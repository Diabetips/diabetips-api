/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Nov 28 2020
*/

import express = require("express");
import prometheus = require("prom-client");

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
