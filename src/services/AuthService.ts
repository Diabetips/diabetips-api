/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Sep 11 2019
*/

import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");

import { config } from "../config";
import { AuthApp, User } from "../entities";
import { ApiError, AuthError } from "../errors";
import { AuthInfo, Context, HttpStatus } from "../lib";
import { logger } from "../logger";

import { BaseService } from "./BaseService";

interface AuthCodeRes {
    code: string;
}

interface AccessTokenRes {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface AccessAndRefreshTokensRes extends AccessTokenRes {
    refresh_token: string;
}

export class AuthService extends BaseService {

    public static async decodeAuthorization(header: string | undefined): Promise<AuthInfo | undefined> {
        if (header == null) {
            return undefined;
        }
        header = header.trimLeft();

        if (header.startsWith("Bearer ")) {
            const token = header.slice(7).trim();
            return AuthService.decodeBearerToken(token);
        } else if (header.startsWith("Basic ")) {
            const creds = header.slice(6).trim();
            return AuthService.decodeBasicClientCredentials(creds);
        } else {
            return;
        }
    }

    public static async decodeBearerToken(token: string): Promise<AuthInfo> {
        try {
            const body = await this.verifyToken(token);
            if (typeof body !== "object") {
                throw new Error("invalid type for token body: " + typeof body);
            }
            return { type: "user", uid: body.sub };
        } catch (err) {
            logger.warn("Token verification failed:", err.message);
            throw new AuthError("invalid_auth", "Invalid authorization token");
        }
    }

    public static async decodeBasicClientCredentials(creds: string): Promise<AuthInfo> {
        try {
            const [clientId, clientSecret] = Buffer.from(creds, "base64").toString().split(":", 2);

            const app = await AuthApp.findByClientId(clientId, { selectClientCredentials: true });

            if (app == null) {
                throw new Error("invalid client id");
            }

            if (clientSecret !== app.clientSecret) {
                throw new Error("client secret mismatched");
            }

            app.clientSecret = undefined;

            return { type: "app", app };
        } catch (err) {
            logger.warn("Client credentials verification failed:", err.message);
            throw new AuthError("invalid_client", "Invalid client credentials");
        }
    }

    public static async authorize(ctx: Context, req: any): Promise<AuthCodeRes | AccessTokenRes> {
        if (ctx.auth == null) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token");
        }
        if (ctx.auth.type !== "user") {
            throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
        }

        // TODO check ctx for scope authorize_app

        switch (req.response_type) {
            case "code":
                return this.doAuthCodeFlow1(ctx.auth.uid, req);
            case "token":
                return this.doImplicitFlow(ctx.auth.uid, req);
            default:
                throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_request", "Missing or invalid response_type");
        }
    }

    public static async getToken(ctx: Context, req: any): Promise<AccessAndRefreshTokensRes> {
        switch (req.grant_type) {
            case "authorization_code":
                return this.doAuthCodeFlow2(req);
            case "password":
                return this.doPasswordFlow(req);
            case "refresh_token":
                return this.doRefreshFlow(req);
            default:
                throw new AuthError("invalid_request", "Missing or invalid grant_type");
        }
    }

    // Generate an authorization code for an application from account portal token
    private static async doAuthCodeFlow1(uid: string, req: any): Promise<AuthCodeRes> {
        return {
            code: "TODO",
        };
    }

    // Generate an access token from account portal token
    private static async doImplicitFlow(uid: string, req: any): Promise<AccessTokenRes> {
        return this.generateAccessToken(uid);
    }

    // Exchange authorization code for tokens
    private static async doAuthCodeFlow2(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.code !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid code");
        }

        try {
            // TODO
            return this.generateAccessAndRefreshTokens("TODO");
        } catch (err) {
            logger.error("Authorization code verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid authorization code");
        }
    }

    // Exchange user credentials for tokens
    private static async doPasswordFlow(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.username !== "string" ||
            typeof req.password !== "string") {
            throw new AuthError("invalid_request", "Missing username or password");
        }

        const user = await User.findByEmail(req.username, {
            selectPassword: true,
        });

        // Prevent timing attacks by always comparing password hashes even when the user doesn't exist
        const hash = user !== undefined
                    ? user.password as string
                    : "$2b$12$xpEzSJMAWy90BQoBd.pttOLu0iaNe8EqQ1A/5WSKRtcvTwAsgBOEy"; // hash of ""

        if (!await bcrypt.compare(req.password, hash) || user === undefined) {
            throw new AuthError("invalid_grant", "Incorrect email or password");
        }

        return this.generateAccessAndRefreshTokens(user.uid);
    }

    // Exchange refresh token for new tokens
    private static async doRefreshFlow(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.refresh_token !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid refresh_token");
        }

        try {

            return this.generateAccessAndRefreshTokens("TODO");
        } catch (err) {
            logger.error("Refresh token verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid refresh token");
        }
    }

    private static async generateAccessAndRefreshTokens(subject: string): Promise<AccessAndRefreshTokensRes> {
        return {
            ...await this.generateAccessToken(subject),
            refresh_token: "TODO"
        };
    }

    private static async generateAccessToken(subject: string): Promise<AccessTokenRes> {
        return {
            access_token: await this.generateToken({
                subject,
                expiresIn: "1h",
            }),
            token_type: "bearer",
            expires_in: 3600,
        };
    }

    private static generateToken(options: jwt.SignOptions): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, config.auth.token_key, {
                algorithm: "RS512", // TODO use ES256 instead for faster gen and verif + smaller tokens
                ...options,
            }, (err, token) => {
                if (err != null) {
                    return reject(err);
                } else {
                    return resolve(token);
                }
            });
        });
    }

    private static verifyToken(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            jwt.verify(token, config.auth.token_key, {
                algorithms: [ "RS512" ],
            }, (err, decoded) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }

}
