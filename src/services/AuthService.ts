/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Sep 11 2019
*/

import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import uuid = require("uuid");

import { config } from "../config";
import { AuthApp, AuthRefreshToken, AuthUserApp, User } from "../entities";
import { ApiError, AuthError } from "../errors";
import { AuthInfo, Context, HttpStatus } from "../lib";
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

/*
Scopes test:
    App: implicit & app.rscopes
    User: requested | implicit & (app.scopes | user.scopes)
*/

type RevokedAuth = { id: string, exp: number };
let revokedUserApps: RevokedAuth[] = [];
let revokedAccessTokens: RevokedAuth[] = [];
let revokedRefreshTokens: RevokedAuth[] = [];

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
            if (revokedAccessTokens.find((val) => val.id === jti) != null) {
                throw new Error("access token was revoked");
            }

            const rti = body.rti;
            if (typeof(rti) === "string") {
                const revoked = revokedRefreshTokens.find((val) => val.id === rti);
                if (revoked != null) {
                    revokedAccessTokens.push({ id: jti, exp: revoked.exp });
                    throw new Error("refresh token associated with access token was revoked");
                }
            }

            return {
                type: "user",
                uid: body.sub,
                clientId: body.client_id,
                scopes: (body.scope || "").split(" "),
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

        const user = await User.findByUid(ctx.auth.uid);
        if (user == null) {
            throw new AuthError("server_error", "User not found");
        }

        if (typeof req.client_id !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid client_id");
        }
        const app = await AuthApp.findByClientId(req.client_id);
        if (app == null) {
            throw new  AuthError("invalid_client", "Invalid client_id");
        }

        switch (req.response_type) {
            case "code":
                return this.doAuthCodeFlow1(user, app);
            case "token":
                return this.doImplicitFlow(user, app);
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
                return this.doAuthCodeFlow2(req, ctx.auth.app);
            case "password":
                return this.doPasswordFlow(req, ctx.auth.app);
            case "refresh_token":
                return this.doRefreshFlow(req, ctx.auth.app);
            default:
                throw new AuthError("invalid_request", "Missing or invalid grant_type");
        }
    }

    // RFC 7009: Revoke access tokens and the refresh token associated with them
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

            revokedAccessTokens.push({ id: body.jti, exp: body.exp * 1000 });

            const rti = body.rti;
            if (typeof rti === "string") {
                // TODO find and revoke refresh token
                revokedRefreshTokens.push({ id: rti, exp: Date.now() + config.auth.token_ttl * 1000 });
            }
        } catch (err) {
            logger.warn("Token revocation failed:", err.message);
            return;
        }
    }

    public static async getAllAuthorizedUserApps(uid: string): Promise<object[]> {
        const uas = await AuthUserApp.findAllByUid(uid);
        return uas.map((ua) => {
            return {
                appid: ua.app.appid,
                name: ua.app.name,
                date: ua.date,
                scopes: ua.scopes,
            };
        });
    }

    private static async authorizeUserApp(user: User, app: AuthApp): Promise<AuthUserApp> {
        let ua = await AuthUserApp.findByUidAndAppid(user.uid, app.appid);
        if (ua != null) {
            // TODO check if requested restricted scopes are still authorized to user
            // add other missing scopes to ua
            return ua;
        }

        ua = new AuthUserApp();
        ua.user = user;
        ua.app = app;
        ua.scopes = []; // TODO get list of scopes and check restricted

        return ua.save();
    }

    public static async deauthorizeUserApp(uid: string, appid: string): Promise<void> {
        const ua = await AuthUserApp.findByUidAndAppid(uid, appid);
        if (ua == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_app_not_found", "User app not found");
        }

        const exp = Date.now() + config.auth.token_ttl * 1000;
        revokedUserApps.push({ id: ua.id, exp });
        ua.refresh_tokens.forEach((rt) => {
            revokedRefreshTokens.push({ id: rt.id, exp });
        });


        ua.revoked = true;
        await ua.save();

        await Promise.all(ua.refresh_tokens.map((rt) => {
            rt.revoked = true;
            return rt.save()
        }));
    }

    // RFC 6749, section 4.1.1: Generate an authorization code
    private static async doAuthCodeFlow1(user: User, app: AuthApp): Promise<AuthCodeRes> {
        return {
            code: "TODO",
        };
    }

    // RFC 6749, section 4.1.3: Generate access and refresh token from an authorization code
    private static async doAuthCodeFlow2(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.code !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid code");
        }

        return null;
    }

    // RFC 6749, section 4.2.1: Generate an access token
    private static async doImplicitFlow(user: User, app: AuthApp): Promise<AccessTokenRes> {
        return this.generateAccessTokenRes(user, app);
    }

    // RFC 6749, section 4.3.2: Exchange user credentials for access and refresh tokens
    private static async doPasswordFlow(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
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

        return this.generateAccessAndRefreshTokensRes(user, app);
    }

    // RFC 6749, section 6: Exchange a refresh token for a new access token
    private static async doRefreshFlow(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.refresh_token !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid refresh_token");
        }

        const rt = await AuthRefreshToken.findByToken(req.refresh_token);
        if (rt == null || rt.revoked || rt.auth.app.id !== app.id) {
            throw new AuthError("invalid_grant", "Invalid refresh token");
        }

        return this.generateAccessAndRefreshTokensRes(rt.auth.user, rt.auth.app, rt);
    }

    private static async generateAccessTokenRes(user: User, app: AuthApp): Promise<AccessTokenRes> {
        return {
            access_token: await this.generateAccessToken(user, app),
            token_type: "bearer",
            expires_in: config.auth.token_ttl,
        };
    }

    private static async generateAccessAndRefreshTokensRes(user: User, app: AuthApp, rt?: AuthRefreshToken): Promise<AccessTokenRes & RefreshTokenRes> {
        if (rt == null) {
            rt = await this.generateRefreshToken(user, app);
        }

        return {
            access_token: await this.generateAccessToken(user, app, rt.id),
            token_type: "bearer",
            expires_in: config.auth.token_ttl,
            refresh_token: rt.token,
        };
    }

    private static async generateAccessToken(user: User, app: AuthApp, rti?: string): Promise<AccessToken> {
        const aid = rti == null ? (await this.authorizeUserApp(user, app)).id : undefined;

        return this.generateJwt({
            jti: uuid.v4(),
            rti,
            aid,
            sub: user.uid,
            client_id: app.clientId,
        }, {
            expiresIn: config.auth.token_ttl,
        });
    }

    private static async generateRefreshToken(user: User, app: AuthApp): Promise<AuthRefreshToken> {
        const auth = await this.authorizeUserApp(user, app);

        const rt = new AuthRefreshToken();
        rt.token = uuid.v4();
        rt.scopes = [];
        rt.auth = auth;

        return rt.save();
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

setInterval(() => {
    function notExpired(val: { exp: number }): boolean {
        return val.exp > Date.now();
    }

    revokedUserApps = revokedUserApps.filter(notExpired);
    revokedAccessTokens = revokedAccessTokens.filter(notExpired);
    revokedRefreshTokens = revokedRefreshTokens.filter(notExpired);
}, 60 * 1000)
