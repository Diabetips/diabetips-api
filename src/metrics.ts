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

metricsApp.get("/metrics", (req, res) => {
    res.send(registry.metrics());
});

metricsApp.get("/metricsdb", (req, res) => {
    res.send(registryDb.metrics());
});
