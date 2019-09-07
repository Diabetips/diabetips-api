/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Sep 02 2019
*/

import nodemailer = require("nodemailer");
import pug = require("pug");

import { config } from "./config";

export const mail = nodemailer.createTransport(config.mail, config.mailDefaults);
export function render(file: string, options?: pug.Options & pug.LocalsObject): string {
    return pug.renderFile(`views/${file}.pug`, options as pug.Options & pug.LocalsObject);
}
