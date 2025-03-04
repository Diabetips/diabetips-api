/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 15 2019
*/

import { config } from "../config";
import { User } from "../entities";

import { Lang } from ".";

class English implements Lang {
    mail = {
        "account-deletion": {
            subject: "Account disabled",
            title: "Account disabled",
            text: [
                "Hi,",
                "As you requested, your Diabetips account has been disabled.",
                "If you did not make this request or if you change your mind, please contact our support team to re-enable it.",
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
        "account-email-changed": {
            subject: "Email address changed",
            title: "Email address changed",
            intro_text: [
                "Hi,",
                "The email address for your Diabetips account has been modified.",
            ],
            old_email_text: "Your old email address:",
            new_email_text: "Your new email address:",
            outro_text: [
                "If you did not make this request, please contact our support team as soon as possible to cancel it.",
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
        "account-password-changed": {
            subject: "Password changed",
            title: "Password changed",
            text: [
                "Hi,",
                "The password for your Diabetips account has been modified.",
                "If you did not make this request, please contact our support team as soon as possible to cancel it.",
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
        "account-password-reset": {
            subject: "Password reset",
            title: "Password reset",
            intro_text: [
                "Hi,",
                "You recently requested to reset your Diabetips account password.",
            ],
            reset_text: "You can reset your password by clicking on the following link.",
            reset_link: config.diabetips.accountUrl + "/reset-password",
            reset_button: "Reset my password",
            outro_text: [
                "If you did not make this request, please contact our support team as soon as possible to cancel it.",
                "The link will expire after 24 hours and can only be used once.",
                "",
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
        "account-registration": {
            subject: "Welcome to Diabetips! Email address confirmation",
            title: "Welcome!",
            intro_text: [
                "Hi,",
                "We are happy to welcome you to Diabetips!",
                "Your account has been created, here is your log in information:",
            ],
            email_text: "Email address:",
            password_text: "Password:",
            password_text2: "the one you gave while registering",
            confirm_text: "Please confirm your address email by clicking the following link to finalize your registration and start using Diabetips.",
            confirm_link: config.diabetips.accountUrl + "/confirm",
            confirm_button: "Confirm my account",
            outro_text: [
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
        "invite-connection": {
            subject: "Invitation to join Diabetips",
            title: "Invitation",
            intro_text: [
                "Hi,",
            ],
            inviter_text1: "",
            inviter_text2: " has invited you to join Diabetips!",
            join_link: config.diabetips.accountUrl + "/register",
            join_button: "Join Diabetips",
            outro_text: [
                "Cheers!",
                "The Team at Diabetips",
            ],
        },
    };
    mail_template = {
        template_baseline: "Diaby, the artificial intelligence for diabetics",
        template_website: "https://diabetips.fr",
        template_website_alt: "Diabetips Website",
        template_copyright: "© Copyright 2019-2020 Diabetips. All rights reserved.",
        template_contact: "Contact us:",
        template_contact_email: "contact@diabetips.fr",
    };

    notif = {
        "chat_message": ((params: { content: string, from: User }) => ({
            title: `${params.from.first_name} ${params.from.last_name}:`,
            body: params.content,
        })),
        "predictions_enabled": ((params: {}) => ({
            title: "Insulin predictions unlocked",
            body: `Insulin predictions are now available for your account!`,
        })),
        "user_invite": ((params: { from: User }) => ({
            title: "Connection request",
            body: `Dr. ${params.from.last_name} requested access to your medical information`,
        })),
        "user_invite_accepted": ((params: { from: User }) => ({
            title: "Invitation accepted",
            body: `${params.from.first_name} ${params.from.last_name} accepted your connection request`,
        })),
        "test": ((params: {}) => ({
            title: "Test notification",
            body: "🤖 beep boop!"
        })),
    }
}

export const lang = new English();
