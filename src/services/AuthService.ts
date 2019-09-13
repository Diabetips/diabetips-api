/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Sep 11 2019
*/

import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");

import { config } from "../config";
import { User } from "../entities";
import { AuthError } from "../errors";
import { jsonReplacer } from "../lib/utils";
import { BaseService } from "./BaseService";

export interface ITokenReq {
    grant_type: string;
    username?: string;
    password?: string;
}

export interface ITokenRes {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export class AuthService extends BaseService {

    public static async getToken(req: ITokenReq): Promise<ITokenRes> {
        // TODO:
        // * check client ID and secret
        switch (req.grant_type) {
            case "authorization_code":
                return this.doAuthCodeFlow(req);
            case "password":
                return this.doPasswordFlow(req);
            case "refresh_token":
                return this.doRefreshFlow(req);
            default:
                throw new AuthError("invalid_request", "Missing or invalid grant_type");
        }
    }

    private static async doAuthCodeFlow(req: ITokenReq): Promise<ITokenRes> {
        return {
            access_token: "abcdef",
            refresh_token: "ghijkl",
            token_type: "bearer",
            expires_in: 3600,
        };
    }

    private static async doPasswordFlow(req: ITokenReq): Promise<ITokenRes> {
        if (typeof req.username !== "string" || typeof req.password !== "string") {
            throw new AuthError("invalid_request", "Missing username or password");
        }

        const user = await User.findByEmail(req.username, { selectPassword: true });

        // Prevent timing attacks by always comparing password hashes even when the user doesn't exist
        const hash = user !== undefined
                    ? user.password as string
                    : "$2b$12$xpEzSJMAWy90BQoBd.pttOLu0iaNe8EqQ1A/5WSKRtcvTwAsgBOEy"; // hash of ""

        if (!await bcrypt.compare(req.password, hash) || user === undefined) {
            throw new AuthError("invalid_grant", "Incorrect email or password");
        }

        return this.generateToken(req, user);
    }

    private static async doRefreshFlow(req: ITokenReq): Promise<ITokenRes> {
        return {
            access_token: "abcdef",
            refresh_token: "ghijkl",
            token_type: "bearer",
            expires_in: 3600,
        };
    }

    private static async generateToken(req: ITokenReq, user: User): Promise<ITokenRes> {
        const accessToken = await new Promise<string>((resolve, reject) => {
            jwt.sign({}, config.auth.token_key, {
                algorithm: "RS512",
                expiresIn: "1h",
                subject: user.uid,
            }, (err, token) => {
                if (err != null) {
                    return reject(err);
                } else {
                    return resolve(token);
                }
            });
        });
        const refreshToken = await new Promise<string>((resolve, reject) => {
            jwt.sign({}, config.auth.token_key, {
                algorithm: "RS512",
                expiresIn: "7d",
                subject: user.uid,
            }, (err, token) => {
                if (err != null) {
                    return reject(err);
                } else {
                    return resolve(token);
                }
            });
        });
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: "bearer",
            expires_in: 3600,
        };
    }

}
