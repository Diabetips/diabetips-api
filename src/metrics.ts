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

// Auth request counter (type, client_id)
export const authRequests = new prometheus.Counter({
    name: "auth_requests_total",
    help: "Number of authentication requests",
    labelNames: ["type", "client_id"],
    registers: [registry],
});

// Auth errors counter (type, client_id, error)
export const authErrors = new prometheus.Counter({
    name: "auth_errors_total",
    help: "Number of authentication errors",
    labelNames: ["type", "client_id", "error"],
    registers: [registry],
});

//
// DATABASE METRICS
//

const registryDb = new prometheus.Registry();

metricsApp.get("/metricsdb", async (req, res) => {
    res.send(await registryDb.metrics());
});

function addEntityGauge(entity: typeof BaseEntity, options: prometheus.GaugeConfiguration<string>) {
    const gauge = new prometheus.Gauge({
        ...options,
        registers: [registryDb],
        collect: async () => {
            gauge.set(await entity.count({where: "deleted = false"}));
        },
    });
    return gauge;
}

// Events
addEntityGauge(entities.Event, {
    name: "db_events_count",
    help: "Number of events in the database",
});

// Insulin
addEntityGauge(entities.Insulin, {
    name: "db_insulin_count",
    help: "Number of insulin in the database",
});

// Meals
addEntityGauge(entities.Meal, {
    name: "db_meals_count",
    help: "Number of meals in the database",
});

// Notes
addEntityGauge(entities.Note, {
    name: "db_notes_count",
    help: "Number of notes in the database",
});

// Planning event
addEntityGauge(entities.PlanningEvent, {
    name: "db_planning_event_count",
    help: "Number of planning events in the database",
});

// Recipes
addEntityGauge(entities.Recipe, {
    name: "db_recipes_count",
    help: "Number of recipes in the database",
});

// Sticky notes
addEntityGauge(entities.StickyNote, {
    name: "db_sticky_notes_count",
    help: "Number of sticky notes in the database",
});

// Users
addEntityGauge(entities.User, {
    name: "db_users_count",
    help: "Number of users in the database",
});
