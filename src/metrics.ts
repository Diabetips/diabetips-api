/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sat Nov 28 2020
*/

import express = require("express");
import prometheus = require("prom-client");
import { BaseEntity, FindManyOptions } from "typeorm";

import * as entities from "./entities";

export const metricsApp = express();

//
// GENERAL METRICS
//

const registry = new prometheus.Registry();

metricsApp.get("/metrics", async (req, res) => {
    res.send(await registry.metrics());
});

// Process metrics
prometheus.collectDefaultMetrics({
    register: registry,
});

// Request time (method, route) summary
export const requestResponseTime = new prometheus.Summary({
    name: "requests_response_time",
    help: "Summary of requests response time (in milliseconds)",
    labelNames: ["method", "route", "response_code"],
    percentiles: [0.5, 0.9, 0.99, 0.999],
    registers: [registry],
});

// Request size (method, route) summary
export const requestResponseSize = new prometheus.Summary({
    name: "requests_response_size",
    help: "Summary of requests response size (in bytes)",
    labelNames: ["method", "route", "response_code"],
    percentiles: [0.5, 0.9, 0.99, 0.999],
    registers: [registry],
});

// Request counter (method, route, response_code) counter
export const requestTotals = new prometheus.Counter({
    name: "requests_total",
    help: "Number of requests",
    labelNames: ["method", "route", "response_code"],
    registers: [registry],
});

//
// DATABASE METRICS
//

const registryDb = new prometheus.Registry();

metricsApp.get("/metricsdb", async (req, res) => {
    res.send(await registryDb.metrics());
});

type MetricsEntity = {
    entity: typeof BaseEntity,
    conditions?: FindManyOptions<BaseEntity>
};

const metricsEntities: MetricsEntity[] = [
    { entity: entities.BloodSugar,       conditions: { where: "deleted = false" }},
    { entity: entities.Event,            conditions: { where: "deleted = false" }},
    { entity: entities.Food,             conditions: { where: "deleted = false" }},
    { entity: entities.Hba1c,            conditions: { where: "deleted = false" }},
    { entity: entities.Insulin,          conditions: { where: "deleted = false" }},
    { entity: entities.Meal,             conditions: { where: "deleted = false" }},
    { entity: entities.Note,             conditions: { where: "deleted = false" }},
    { entity: entities.PhysicalActivity, conditions: { where: "deleted = false" }},
    { entity: entities.PlanningEvent,    conditions: { where: "deleted = false" }},
    { entity: entities.Prediction },
    { entity: entities.Recipe,           conditions: { where: "deleted = false" }},
    { entity: entities.StickyNote,       conditions: { where: "deleted = false" }},
    { entity: entities.User,             conditions: { where: "deleted = false" }},
];

const dbEntitiesGauge = new prometheus.Gauge({
    name: "db_entity",
    help: "Number of database entities",
    labelNames: ["entity"],
    registers: [registryDb],
    collect: async () => {
        await Promise.all(metricsEntities.map(async (e) => {
            dbEntitiesGauge.set({ entity: e.entity.name }, await e.entity.count(e.conditions))
        }));
    },
});
