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
import { getLang } from "./i18n";
import { logger } from "./logger";

const mail = nodemailer.createTransport(config.mail, config.mailDefaults);

mail.verify((err, success) => {
    if (err) {
        logger.error(err.stack || err);
    }
});

export async function sendMail(template: string,
                               lang: string,
                               to: string | string[],
                               options?: pug.Options & pug.LocalsObject): Promise<nodemailer.SentMessageInfo> {
    options = {
        ...options,
        ...(await getLang(lang)).mail[template],
        ...(await getLang(lang)).mail_template,
    };

    return mail.sendMail({
        to,
        subject: options.subject,
        html: pug.renderFile(`views/mails/${template}.pug`, options as pug.Options & pug.LocalsObject),
    });
}
