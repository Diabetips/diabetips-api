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
import { AuthError } from "../errors";
import { AuthInfo, Context } from "../lib";
import { logger } from "../logger";

import { BaseService } from "./BaseService";

type AccessToken = string;

interface AuthCodeRes {
    code: string;
}

interface AccessTokenRes {
    access_token: AccessToken;
    token_type: string;
    expires_in: number;
}

interface RefreshTokenRes {
    refresh_token: string;
}

// keep ids here for 2*access token TTL
let revokedAccessTokens: { jti: string, exp: number }[] = [];
let revokedRefreshTokens: { rti: string, exp: number }[] = [];

export class AuthService extends BaseService {

    public static async decodeAuthorization(header: string | undefined): Promise<AuthInfo | undefined> {
        if (header == null) {
            return undefined;
        }
        header = header.trimLeft();

        if (header.toLowerCase().startsWith("bearer ")) {
            const token = header.slice(7).trim();
            return AuthService.decodeBearerToken(token);
        } else if (header.toLowerCase().startsWith("basic ")) {
            const creds = header.slice(6).trim();
            return AuthService.decodeBasicClientCredentials(creds);
        } else {
            return;
        }
    }

    private static async decodeBearerToken(token: string): Promise<AuthInfo> {
        try {
            const body = await this.verifyJwt(token);
            if (typeof body !== "object") {
                throw new Error("invalid type for token body: " + typeof body);
            }

            const jti = body.jti;
            if (revokedAccessTokens.find((val) => val.jti === jti) != null) {
                throw new Error("access token was revoked");
            }

            const rti = body.rti;
            if (typeof(rti) === "string") {
                const revoked = revokedRefreshTokens.find((val) => val.rti === rti);
                if (revoked != null) {
                    revokedAccessTokens.push({ jti, exp: revoked.exp });
                    throw new Error("refresh token associated with access token was revoked");
                }
            }

            return {
                type: "user",
                uid: body.sub,
                clientId: body.client_id,
            };
        } catch (err) {
            logger.warn("Token verification failed:", err.message);
            throw new AuthError("invalid_auth", "Invalid authorization token");
        }
    }

    private static async decodeBasicClientCredentials(creds: string): Promise<AuthInfo> {
        try {
            const [clientId, clientSecret] = Buffer.from(creds, "base64").toString().split(":", 2);

            const app = await AuthApp.findByClientId(clientId, { selectClientCredentials: true });
            if (app == null) {
                throw new Error("invalid client id");
            }

            if (clientSecret !== app.clientSecret) {
                throw new Error("client secret mismatched");
            }
            app.clientSecret = undefined; // erase client secret from object

            return { type: "app", app };
        } catch (err) {
            logger.warn("Client credentials verification failed:", err.message);
            throw new AuthError("invalid_client", "Invalid client credentials");
        }
    }

    public static async authorize(ctx: Context, req: any): Promise<AuthCodeRes | AccessTokenRes> {
        if (ctx.auth == null || ctx.auth.type !== "user") {
            throw new AuthError("access_denied", "Access denied");
        }

        // TODO check that app has auth:authorize scope

        // TODO extra info? (type (browser,desktop,mobile), subtype (chrome,firefox,windows,linux,ios,android), ip)

        // TODO register grant in user apps

        switch (req.response_type) {
            case "code":
                return this.doAuthCodeFlow1(ctx.auth.uid, req);
            case "token":
                return this.doImplicitFlow(ctx.auth.uid, req);
            default:
                throw new AuthError("invalid_request", "Missing or invalid response_type");
        }
    }

    public static async getToken(ctx: Context, req: any): Promise<AccessTokenRes & RefreshTokenRes> {
        if (ctx.auth == null || ctx.auth.type !== "app") {
            throw new AuthError("invalid_client", "Missing client credentials");
        }

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

    public static async revokeToken(ctx: Context, req: any): Promise<void> {
        // Errors should not be reported to the client according to the RFC but we still do for simple errors
        if (ctx.auth == null || ctx.auth.type !== "app") {
            throw new AuthError("invalid_client", "Missing client credentials");
        }

        if (typeof req.token !== "string") {
            throw new AuthError("invalid_request", "Missing token");
        }

        try {
            const body = await this.verifyJwt(req.token);
            if (typeof body !== "object") {
                throw new Error("invalid type for token body: " + typeof body);
            }

            if (ctx.auth.app.clientId !== body.client_id) {
                throw new Error("client_id mismatched");
            }

            // TODO add access token to revoked list
            // add refresh token id to rti revoked list
            // revoke refresh token
        } catch (err) {
            logger.warn("Token revocation failed:", err.message);
            return;
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
    private static async doAuthCodeFlow2(req: any): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.code !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid code");
        }

        try {
            return null;
        } catch (err) {
            logger.error("Authorization code verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid authorization code");
        }
    }

    // Exchange user credentials for tokens
    private static async doPasswordFlow(req: any): Promise<AccessTokenRes & RefreshTokenRes> {
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

        return null;
    }

    // Exchange refresh token for new tokens
    private static async doRefreshFlow(req: any): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.refresh_token !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid refresh_token");
        }

        try {
            // TODO check user and app still exist
            return null;
        } catch (err) {
            logger.error("Refresh token verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid refresh token");
        }
    }

    private static async generateAccessTokenRes(uid: string): Promise<AccessTokenRes> {
        return {
            access_token: await this.generateAccessToken(uid),
            token_type: "bearer",
            expires_in: config.auth.token_ttl,
        };
    }

    private static async generateAccessToken(uid: string): Promise<AccessToken> {
        return this.generateJwt({
            sub: uid
        }, {
            expiresIn: config.auth.token_ttl,
        });
    }

    private static async generateRefreshToken(uid: string): Promise<RefreshToken> {
        return {};
    }

    private static async generateJwt(body: object, options: jwt.SignOptions): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            jwt.sign(body, config.auth.token_key, {
                algorithm: "ES256",
                ...options,
            }, (err, token) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
    }

    private static async verifyJwt(token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            jwt.verify(token, config.auth.token_key, {
                algorithms: [ "ES256" ],
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
