/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 15 2019
*/

import { User } from "../entities";
import { lang as en } from "./en";
import { lang as fr } from "./fr";

// tslint:disable:no-var-requires
const langs = new Map<string, Lang>();
langs.set("en", en);
langs.set("fr", fr);

export const hasLang = (name: string) => langs.has(name);
export const getLang = (name: string) => langs.get(name);
export const getLangs = () => Array.from(langs.keys());

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
        reset_text: string;
        reset_link: string;
        reset_button: string;
        outro_text: string[];
    }
};

type MailAccountRegistration = {
    [key in "account-registration"]: {
        intro_text: string[];
        email_text: string;
        password_text: string;
        password_text2: string;
        confirm_text: string;
        confirm_link: string;
        confirm_button: string;
        outro_text: string[];
    }
};

type MailInviteConnection = {
    [key in "invite-connection"]: {
        intro_text: string[];
        inviter_text1: string;
        inviter_text2: string;
        join_link: string;
        join_button: string;
        outro_text: string[];
    }
};

type Mails = MailBase
    & MailAccountDeletion
    & MailAccountEmailChanged
    & MailAccountPasswordChanged
    & MailAccountPasswordReset
    & MailAccountRegistration
    & MailInviteConnection;

type Notification = { title: string, body: string };
type NotificationBase = {
    [key in string]: (params: any) => Notification;
}
type NotificationChatMessage = {
    [key in "chat_message"]: (params: { content: string, from: User }) => Notification;
}
type NotificationUserInvite = {
    [key in "user_invite"]: (params: { from: User }) => Notification;
}
type NotificationUserInviteAccepted = {
    [key in "user_invite_accepted"]: (params: { from: User }) => Notification;
}
type NotificationTest = {
    [key in "test"]: (params: {}) => Notification;
}

type Notifications = NotificationBase
    & NotificationChatMessage
    & NotificationUserInvite
    & NotificationUserInviteAccepted
    & NotificationTest;

export interface Lang {
    mail: Mails;
    mail_template: {
        template_baseline: string;
        template_website: string;
        template_website_alt: string;
        template_copyright: string;
        template_contact: string;
        template_contact_email: string;
    };
    notif: Notifications;
}
