/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Dec 15 2019
*/

import { Lang } from ".";

class French implements Lang {
    mail = {
        "account-deletion": {
            subject: "Désactivation de votre compte",
            title: "Compte désactivé",
            text: [
                "Bonjour,",
                "Conformément à votre demande, nous avons désactivé votre compte Diabetips.",
                "Si vous n'êtes pas l'origine de cette demande ou si vous changez d'avis, veuillez contacter notre support client afin de le réactiver.",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-email-changed": {
            subject: "Changement de votre adresse email",
            title: "Adresse email modifiée",
            intro_text: [
                "Bonjour,",
                "La modification de l'adresse email de connexion de votre compte Diabetips a bien été prise en compte.",
            ],
            old_email_text: "Votre ancienne adresse :",
            new_email_text: "Votre nouvelle adresse :",
            outro_text: [
                "Si vous n'êtes pas l'origine de ce changement, contactez au plus vite notre support client afin de l'annuler.",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-password-changed": {
            subject: "Changement de votre mot de passe",
            title: "Mot de passe modifié",
            text: [
                "Bonjour,",
                "La modification du mot de passe de connexion de votre compte Diabetips a bien été prise en compte.",
                "Si vous n'êtes pas l'origine de ce changement, contactez au plus vite notre support client afin de l'annuler.",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-password-reset": {
            subject: "Réinitialisation de votre mot de passe",
            title: "Mot de passe réinitialisé",
            intro_text: [
                "Bonjour,",
                "Vous avez récemment demandé la réinitialisation du mot de passe de votre compte Diabetips.",
            ],
            password_text: "Veuillez utiliser le mot de passe temporaire suivant pour vous connecter :",
            outro_text: [
                "Changez-le rapidement !",
                "Si vous n'êtes pas l'origine de cette demande, contactez au plus vite notre support client afin de l'annuler.",
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "account-registration": {
            subject: "Bienvenue sur Diabetips !",
            title: "Bienvenue !",
            intro_text: [
                "Bonjour,",
                "Nous sommes heureux de vous accueillir sur Diabetips !",
                "Votre compte a bien été crée, vos informations de connexion sont les suivantes :",
            ],
            email_text: "Adresse email :",
            password_text: "Mot de passe :",
            password_text2: "celui renseigné pendant l'inscription",
            outro_text: [
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
        "invite-connection": {
            subject: "Invitation à rejoindre Diabetips",
            title: "Invitation",
            intro_text: [
                "Bonjour,",
            ],
            inviter_text1: "",
            inviter_text2: " vous a invité à rejoindre Diabetips !",
            join_link: "https://account.diabetips.fr/register",
            join_text: "Rejoindre Diabetips",
            outro_text: [
                "À bientôt !",
                "L'Équipe Diabetips",
            ],
        },
    };
    mail_template = {
        template_baseline: "Diaby, l'intelligence artificielle au service des diabétiques",
        template_website: "https://diabetips.fr",
        template_website_alt: "Site web Diabetips",
        template_copyright: "© Copyright 2019 Diabetips. Tous droits réservés.",
        template_contact: "Nous contacter :",
        template_contact_email: "contact@diabetips.fr",
    };
}

export const lang = new French();
