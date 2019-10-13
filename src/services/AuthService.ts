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
            let user: User;
            try {
                const body = await this.verifyToken(token);
                if (typeof body !== "object") {
                    throw new Error("invalid type for token body: " + typeof body);
                }

                const tmp = await User.findByUid(body.sub);
                if (tmp == null) {
                    throw new Error("UID not found");
                }
                user = tmp;
            } catch (err) {
                logger.error("Token verification failed:", err.stack || err);
                throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_auth", "Invalid authorization token");
            }

            return { type: "user", user };
        } else if (header.startsWith("Basic ")) {
            // TODO app auth
            return undefined;
        } else {
            return undefined;
        }
    }

    public static async authorize(ctx: Context, req: any): Promise<AuthCodeRes | AccessTokenRes> {
        if (ctx.auth == null) {
            throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide an authorization token");
        }
        if (ctx.auth.type !== "user") {
            throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
        }
        // TODO check that aud of token is account.diabetips.fr (or scope authorize_app)
        // TODO generate different kind of code (not a JWT)

        switch (req.response_type) {
            case "code":
                return this.doAuthCodeFlow1(ctx.auth.user, req);
            case "token":
                return this.doImplicitFlow(ctx.auth.user, req);
            default:
                throw new ApiError(HttpStatus.BAD_REQUEST, "invalid_request", "Missing or invalid response_type");
        }
    }

    public static async getToken(ctx: Context, req: any): Promise<AccessAndRefreshTokensRes> {
        // TODO:
        // * check client ID and secret from context
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
    private static async doAuthCodeFlow1(user: User, req: any): Promise<AuthCodeRes> {
        return {
            code: (await this.generateToken({
                subject: user.uid,
                expiresIn: "1h",
            })),
        };
    }

    // Generate an access token from account portal token
    private static async doImplicitFlow(user: User, req: any): Promise<AccessTokenRes> {
        return this.generateAccessTokenRes(user.uid);
    }

    // Exchange authorization code for tokens
    private static async doAuthCodeFlow2(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.code !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid code");
        }

        let user: User;
        try {
            const body = await this.verifyToken(req.code);
            if (typeof body !== "object") {
                throw new Error("invalid type for code body: " + typeof body);
            }

            const tmp = await User.findByUid(body.sub);
            if (tmp == null) {
                throw new Error("UID not found");
            }
            user = tmp;
        } catch (err) {
            logger.error("Authorization code verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid authorization code");
        }

        return this.generateAccessAndRefreshTokensRes(user.uid);
    }

    // Exchange user credentials for tokens
    private static async doPasswordFlow(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.username !== "string" ||
            typeof req.password !== "string") {
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

        return this.generateAccessAndRefreshTokensRes(user.uid);
    }

    // Exchange refresh token for new tokens
    private static async doRefreshFlow(req: any): Promise<AccessAndRefreshTokensRes> {
        if (typeof req.refresh_token !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid refresh_token");
        }

        let user: User;
        try {
            const body = await this.verifyToken(req.refresh_token);
            if (typeof body !== "object") {
                throw new Error("invalid type for refresh token body: " + typeof body);
            }

            const tmp = await User.findByUid(body.sub);
            if (tmp == null) {
                throw new Error("UID not found");
            }
            user = tmp;
        } catch (err) {
            logger.error("Refresh token verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid refresh token");
        }

        return this.generateAccessAndRefreshTokensRes(user.uid);
    }

    private static async generateAccessAndRefreshTokensRes(subject: string): Promise<AccessAndRefreshTokensRes> {
        return {
            ...await this.generateAccessTokenRes(subject),
            refresh_token: await this.generateToken({
                subject,
                expiresIn: "7d",
            }),
        };
    }

    private static async generateAccessTokenRes(subject: string): Promise<AccessTokenRes> {
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
        // TODO only use this for access tokens, other kinds of tokens should not use JWT
        // also support for multiple keys with kid claim (1 key / server instance)
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, config.auth.token_key, {
                algorithm: "RS512",
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
