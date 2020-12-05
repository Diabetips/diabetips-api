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
