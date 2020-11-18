/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 15 2019
*/

import { config } from "../config";

import { Lang } from ".";

class French implements Lang {
    mail = {
        "account-deletion": {
            subject: "Désactivation de votre compte",
            title: "Compte désactivé",
            text: [
                "Bonjour,",
                "",
                "Conformément à votre demande, nous avons désactivé votre compte Diabetips.",
                "Si vous n'êtes pas l'origine de cette demande ou si vous changez d'avis, veuillez contacter notre support client afin de le réactiver.",
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-email-changed": {
            subject: "Changement de votre adresse email",
            title: "Adresse email modifiée",
            intro_text: [
                "Bonjour,",
                "",
                "La modification de l'adresse email de connexion de votre compte Diabetips a bien été prise en compte.",
            ],
            old_email_text: "Votre ancienne adresse :",
            new_email_text: "Votre nouvelle adresse :",
            outro_text: [
                "Si vous n'êtes pas l'origine de ce changement, contactez au plus vite notre support client afin de l'annuler.",
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-password-changed": {
            subject: "Changement de votre mot de passe",
            title: "Mot de passe modifié",
            text: [
                "Bonjour,",
                "",
                "La modification du mot de passe de connexion de votre compte Diabetips a bien été prise en compte.",
                "Si vous n'êtes pas l'origine de ce changement, contactez au plus vite notre support client afin de l'annuler.",
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-password-reset": {
            subject: "Réinitialisation de votre mot de passe",
            title: "Mot de passe réinitialisé",
            intro_text: [
                "Bonjour,",
                "",
                "Vous avez récemment demandé la réinitialisation du mot de passe de votre compte Diabetips.",
            ],
            reset_text: "Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe.",
            reset_link: config.diabetips.accountUrl + "/reset-password",
            reset_button: "Réinitialiser mon mot de passe",
            outro_text: [
                "Si vous n'êtes pas l'origine de cette demande, contactez au plus vite notre support client afin de l'annuler.",
                "Le lien expirera après 24 heures et ne peut être utilisé qu'une seule fois.",
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-registration": {
            subject: "Bienvenue sur Diabetips ! Confirmation de votre adresse email",
            title: "Bienvenue !",
            intro_text: [
                "Bonjour,",
                "",
                "Nous sommes heureux de vous accueillir sur Diabetips !",
                "Votre compte a bien été crée, vos informations de connexion sont les suivantes :",
            ],
            email_text: "Adresse email :",
            password_text: "Mot de passe :",
            password_text2: "celui renseigné pendant votre inscription",
            confirm_text: "Validez votre adresse email avec le lien suivant pour confirmer votre compte et commencer à utiliser Diabetips.",
            confirm_link: config.diabetips.accountUrl + "/confirm",
            confirm_button: "Confirmer mon compte",
            outro_text: [
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "invite-connection": {
            subject: "Invitation à rejoindre Diabetips",
            title: "Invitation",
            intro_text: [
                "Bonjour,",
                "",
            ],
            inviter_text1: "",
            inviter_text2: " vous a invité à rejoindre Diabetips !",
            join_link: config.diabetips.accountUrl + "/register",
            join_button: "Rejoindre Diabetips",
            outro_text: [
                "",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
    };
    mail_template = {
        template_baseline: "Diaby, l'intelligence artificielle au service des diabétiques",
        template_website: "https://diabetips.fr",
        template_website_alt: "Site web Diabetips",
        template_copyright: "© Copyright 2019-2020 Diabetips. Tous droits réservés.",
        template_contact: "Nous contacter :",
        template_contact_email: "contact@diabetips.fr",
    };

    notif = {
        "user_invite": ((params: any) => ({
            title: "Demande de connexion",
            body: `Dr. ${params.from.lastname} a demandé accès à votre profil patient`,
        })),
        "test": (() => ({
            title: "Notification de test",
            body: "🤖 bip boup !"
        })),
    }
}

export const lang = new French();
