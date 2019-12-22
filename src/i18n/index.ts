/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 15 2019
*/

import fs = require("fs");

type MailBase = {
    [key in string]: {
        subject: string;
        title: string;
    }
};

type MailAccountDeletion = {
    [key in "account-deletion"]: {
        text: string[];
    }
};

type MailAccountEmailChanged = {
    [key in "account-email-changed"]: {
        intro_text: string[];
        old_email_text: string;
        new_email_text: string;
        outro_text: string[];
    }
};

type MailAccountPasswordChanged = {
    [key in "account-password-changed"]: {
        text: string[];
    }
};

type MailAccountPasswordReset = {
    [key in "account-password-reset"]: {
        intro_text: string[];
        password_text: string;
        outro_text: string[];
    }
};

type MailAccountRegistration = {
    [key in "account-registration"]: {
        intro_text: string[];
        email_text: string;
        password_text: string;
        password_text2: string;
        outro_text: string[];
    }
};

type MailInviteConnection = {
    [key in "invite-connection"]: {
        intro_text: string[];
        inviter_text1: string;
        inviter_text2: string;
        join_link: string;
        join_text: string;
        outro_text: string[];
    }
};

type Mail = MailBase & MailAccountDeletion & MailAccountEmailChanged & MailAccountPasswordChanged &
    MailAccountPasswordReset & MailAccountRegistration & MailInviteConnection;

export interface Lang {
    mail: Mail;
    mail_template: {
        template_baseline: string;
        template_website: string;
        template_website_alt: string;
        template_copyright: string;
        template_contact: string;
        template_contact_email: string;
    };
}

const cache = new Map<string, Lang>();

export async function hasLang(name: string): Promise<boolean> {
    async function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            fs.access(path, fs.constants.F_OK, (err) => {
                resolve(err === undefined);
            });
        });
    }

    return exists(`${__dirname}/${name}.ts`) || exists(`${__dirname}/${name}.js`);
}

export async function getLang(name: string): Promise<Lang> {
    if (!cache.has(name)) {
        const lang = (await import(`./${name}`)).lang;
        cache.set(name, lang);
        return lang;
    } else {
        return cache.get(name) as Lang;
    }
}
