/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Sep 11 2019
*/

import bcrypt = require("bcrypt");
import { Request } from "express";
import jwt = require("jsonwebtoken");
import uuid = require("uuid");

import { config } from "../config";
import { AuthApp, AuthCode, AuthRefreshToken, AuthUserApp, User } from "../entities";
import { ApiError, AuthError } from "../errors";
import { AuthInfo, AuthScope, AuthScopes, Context, HttpStatus, Utils } from "../lib";
import { logger } from "../logger";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

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

type RevokedAuth = { id: string, exp: number };
let revokedUserApps: RevokedAuth[] = [];
let revokedAccessTokens: RevokedAuth[] = [];
let revokedRefreshTokens: RevokedAuth[] = [];

export class AuthService extends BaseService {

    public static async authFromRequest(req: Request): Promise<AuthInfo | undefined> {
        const auth = await this.authFromAuthorizationHeader(req.header("authorization"))
        if (auth) return auth;

        const queryToken = req.query["token"] as string | undefined;
        if (queryToken) return this.authFromBearerToken(queryToken);

        return;
    }

    public static async authFromAuthorizationHeader(header: string | undefined): Promise<AuthInfo | undefined> {
        if (header == null) {
            return undefined;
        }
        header = header.trimLeft();

        if (header.toLowerCase().startsWith("bearer ")) {
            const token = header.slice(7).trim();
            return AuthService.authFromBearerToken(token);
        } else if (header.toLowerCase().startsWith("basic ")) {
            const creds = header.slice(6).trim();
            return AuthService.authFromBasicClientCredentials(creds);
        } else if (header.toLowerCase().startsWith("as ") &&
            Utils.optionDefault(config.auth.allow_as, false)) {
            const as = header.slice(3).trim();
            return AuthService.authFromAsExpr(as);
        }
        return;
    }

    public static async authFromBearerToken(token: string): Promise<AuthInfo> {
        try {
            const body = await this.verifyJwt(token);
            if (typeof body !== "object") {
                throw new Error("invalid type for token body: " + typeof body);
            }

            const jti = body.jti;
            if (revokedAccessTokens.find((val) => val.id === jti) != null) {
                throw new Error("access token was revoked");
            }

            function checkRevokedList(id: any, list: RevokedAuth[], type: string): void {
                if (typeof(id) === "string") {
                    const revoked = list.find((val) => val.id === id);
                    if (revoked != null) {
                        revokedAccessTokens.push({ id: jti, exp: revoked.exp });
                        throw new Error(`${type} associated with access token was revoked`);
                    }
                }
            }

            checkRevokedList(body.rti, revokedRefreshTokens, "refresh token");
            checkRevokedList(body.aid, revokedUserApps, "user app authorization");

            return {
                type: "user",
                uid: body.sub,
                appid: body.appid,
                scopes: (body.scope || "").split(" "),
            };
        } catch (err) {
            logger.warn("Token verification failed:", err.message);
            throw new AuthError("invalid_auth", "Invalid authorization token");
        }
    }

    public static async authFromBasicClientCredentials(creds: string): Promise<AuthInfo> {
        try {
            const [clientId, clientSecret] = Buffer.from(creds, "base64").toString().split(":", 2);

            const app = await AuthApp.findByClientId(clientId, { selectClientCredentials: true });

            const hash = app != null
                    ? app.clientSecret!
                    : "$2b$06$xpEzSJMAWy90BQoBd.pttOLu0iaNe8EqQ1A/5WSKRtcvTwAsgBOEy"; // hash of ""

            if (!(await bcrypt.compare(clientSecret, hash) && app != null)) {
                throw new Error(app == null ? "client id not found" : "invalid client secret");
            }
            app.clientSecret = undefined; // erase client secret from object

            return { type: "app", app };
        } catch (err) {
            logger.warn("Client credentials verification failed:", err.message);
            throw new AuthError("invalid_client", "Invalid client credentials");
        }
    }

    public static async authFromAsExpr(as: string): Promise<AuthInfo> {
        return {
            type: "user",
            uid: as,
            appid: "",
            scopes: [],
        };
    }

    public static async checkScopesAuthorized(auth: AuthInfo | undefined, params: { [key: string]: string }, scopes: AuthScope[]): Promise<void> {
        try {
            if (auth != null && (
                (auth.type === "user" && auth.scopes.includes("special:admin")) ||
                (auth.type === "app" && auth.app.extra_scopes.includes("special:diaby")))) {
                return;
            }
            await Promise.all(scopes.map(async (scope) => {
                if (!AuthScopes.hasOwnProperty(scope)) {
                    throw new Error(`Invalid scope name '${scope}'`);
                }

                if (auth == null) {
                    throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide authorization");
                }

                const si = AuthScopes[scope];
                if (si.target === "app" && si.restricted) {
                    if (auth.type !== "app") {
                        throw new ApiError(HttpStatus.UNAUTHORIZED, "access_denied", "Please provide app credentials");
                    }
                    const app = auth.app;
                    if (!app.extra_scopes.includes(scope)) {
                        logger.warn(`App ${app.appid} doesn't have restricted scope ${scope}`);
                        throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
                    }
                } else if (si.target === "user") {
                    if (auth.type !== "user") {
                        throw new ApiError(HttpStatus.UNAUTHORIZED, "unauthorized", "Please provide user authorization");
                    }
                    if (!si.implicit && !auth.scopes.includes(scope)) {
                        logger.warn(`Scope '${scope}' is not authorized`);
                        throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
                    }
                    if (si.implicit && si.restricted) {
                        const user = await User.findByUid(auth.uid);
                        if (user == null) {
                            throw new Error("User not found");
                        }
                        if (!user.extra_scopes.includes(scope)) {
                            logger.warn(`User ${user.uid} doesn't have restricted scope '${scope}'`);
                            throw new ApiError(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
                        }
                    }
                }

                if (si.checker != null) {
                    await si.checker(auth, params);
                }
            }));
        } catch (err) {
            if (!(Utils.optionDefault(config.auth.ignore_unauthorized, false) && err instanceof ApiError)) {
                throw err;
            } else {
                logger.warn("Ignoring unauthorized error:", err.message);
            }
        }
    }

    // RFC 6749, section 3.1: Authorization endpoint (for internal use by account portal)
    public static async authorize(ctx: Context, req: any): Promise<AuthCodeRes | AccessTokenRes> {
        const user = await UserService.getCurrentUser(ctx);

        if (typeof req.client_id !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid client_id");
        }
        const app = await AuthApp.findByClientId(req.client_id);
        if (app == null) {
            throw new  AuthError("invalid_client", "Invalid client_id");
        }

        const scope = req.scope || "";
        if (typeof scope !== "string") {
            throw new AuthError("invalid_scope", "Malformed scope");
        }

        switch (req.response_type) {
            case "code":
                return this.doAuthCodeFlow1(user, app, scope);
            case "token":
                return this.doImplicitFlow(user, app, scope);
            default:
                throw new AuthError("invalid_request", "Missing or invalid response_type");
        }
    }

    // RFC 6749, section 3.2: Token endpoint
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

            if (ctx.auth.app.appid !== body.appid) {
                throw new Error("client_id mismatched");
            }

            revokedAccessTokens.push({ id: body.jti, exp: body.exp * 1000 });

            const rti = body.rti;
            if (typeof rti === "string") {
                const rt = await AuthRefreshToken.findOne(rti);
                if (rt != null) {
                    this.revokeRefreshToken(rt);
                }
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
                description: ua.app.description,
                date: ua.date,
                scopes: ua.scopes,
            };
        });
    }

    public static async authorizeUserApp(user: User, app: AuthApp, scope: string): Promise<[AuthUserApp, AuthScope[]]> {
        const scopes = scope.split(" ")
            .filter((s) => s !== "")
            .map((s) => {
                if (!AuthScopes.hasOwnProperty(s)) {
                    throw new AuthError("invalid_scope", `Invalid scope name '${s}'`);
                }
                return s as AuthScope;
            })
            .filter((s) => {
                const si = AuthScopes[s as AuthScope];
                if (si.target !== "user") {
                    throw new AuthError("invalid_scope", `Scope '${s}' is not available to users`);
                }

                if (si.restricted && !user.extra_scopes.includes(s) && !app.extra_scopes.includes(s)) {
                    throw new AuthError("invalid_scope", `Scope '${s}' is not available to the current user`);
                }

                return !si.implicit;
            });

        let ua = await AuthUserApp.findByUidAndAppid(user.uid, app.appid);
        if (ua != null) {
            ua.date = new Date();
            ua.scopes = ua.scopes.concat(scopes.filter((s) => !ua!.scopes.includes(s)));
            return [await ua.save(), ua.scopes];
        }

        ua = new AuthUserApp();
        ua.user = user;
        ua.app = app;
        ua.scopes = scopes;

        return [await ua.save(), scopes];
    }

    public static async deauthorizeUserApp(uid: string, appid: string): Promise<void> {
        const ua = await AuthUserApp.findByUidAndAppid(uid, appid, { selectAuthCodesAndRefreshTokens: true });
        if (ua == null) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_app_not_found", "User app not found");
        }
        return this.revokeUserApp(ua);
    }

    // RFC 6749, section 4.1.1: Generate an authorization code
    private static async doAuthCodeFlow1(user: User, app: AuthApp, scope: string): Promise<AuthCodeRes> {
        const code = await this.generateAuthCode(user, app, scope);
        return {
            code: code.code,
        };
    }

    // RFC 6749, section 4.1.3: Generate access and refresh token from an authorization code
    private static async doAuthCodeFlow2(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.code !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid code");
        }

        if (typeof req.redirect_uri !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid redirect_uri");
        }
        if (req.redirect_uri !== app.redirectUri) {
            throw new AuthError("invalid_grant", "Mismatched redirect URI");
        }

        const code = await AuthCode.findByCode(req.code);
        if (code == null || code.used || code.auth.app.id !== app.id) {
            if (code?.used) {
                logger.warn("Authorization code re-use! Revoking refresh token");
                this.revokeRefreshToken(code.refresh_token!);
            }
            if (code != null && code.auth.app.id !== app.id) {
                await this.revokeAuthCode(code);
                logger.warn("Authorization code leaked!");
            }

            throw new AuthError("invalid_grant", "Invalid authorization code");
        }

        const rt = await this.generateRefreshToken(code.auth.user, code.auth.app, code.scopes.join(" "));

        code.used = true;
        code.refresh_token = rt;
        await code.save();

        return this.generateAccessAndRefreshTokensRes(code.auth.user, code.auth.app, rt);
    }

    // RFC 6749, section 4.2.1: Generate an access token
    private static async doImplicitFlow(user: User, app: AuthApp, scope: string): Promise<AccessTokenRes> {
        return this.generateAccessTokenRes(user, app, scope);
    }

    // RFC 6749, section 4.3.2: Exchange user credentials for access and refresh tokens
    private static async doPasswordFlow(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.username !== "string" ||
            typeof req.password !== "string") {
            throw new AuthError("invalid_request", "Missing username or password");
        }

        const scope = req.scope || "";
        if (typeof scope !== "string") {
            throw new AuthError("invalid_scope", "Malformed scope");
        }

        const user = await User.findByEmail(req.username, {
            selectPassword: true,
        });

        // Prevent timing attacks by always comparing password hashes even when the user doesn't exist
        const hash = user != null
            ? user.password!
            : "$2b$12$xpEzSJMAWy90BQoBd.pttOLu0iaNe8EqQ1A/5WSKRtcvTwAsgBOEy"; // hash of ""

        if (!(await bcrypt.compare(req.password, hash) && user != null)) {
            throw new AuthError("invalid_grant", "Incorrect email or password");
        }

        return this.generateAccessAndRefreshTokensRes(user!, app, scope);
    }

    // RFC 6749, section 6: Exchange a refresh token for a new access token
    private static async doRefreshFlow(req: any, app: AuthApp): Promise<AccessTokenRes & RefreshTokenRes> {
        if (typeof req.refresh_token !== "string") {
            throw new AuthError("invalid_request", "Missing or invalid refresh_token");
        }

        try {
            const decoded = Buffer.from(req.refresh_token, "base64").toString().split(":");
            if (decoded.length !== 2) {
                throw new Error("Invalid decoded field count");
            }
            const [rti, secret] = decoded;

            const rt = await AuthRefreshToken.findById(rti);
            const hash = rt != null
                ? rt.secret
                : "$2b$06$xpEzSJMAWy90BQoBd.pttOLu0iaNe8EqQ1A/5WSKRtcvTwAsgBOEy" // hash of ""

            if (!(await bcrypt.compare(secret, hash) && rt != null)) {
                throw new Error(rt == null ? "refresh token not found" : "bad secret");
            }
            if (rt.auth.app.id !== app.id) {
                await this.revokeRefreshToken(rt);
                throw new Error("refresh token leaked!");
            }

            rt.token = req.refresh_token;

            return this.generateAccessAndRefreshTokensRes(rt.auth.user, rt.auth.app, rt);
        } catch (err) {
            logger.error("Refresh token verification failed:", err.stack || err);
            throw new AuthError("invalid_grant", "Invalid refresh token");
        }

    }

    private static async generateAccessTokenRes(user: User, app: AuthApp, scope: string): Promise<AccessTokenRes> {
        return {
            access_token: await this.generateAccessToken(user, app, scope),
            token_type: "bearer",
            expires_in: config.auth.token_ttl,
        };
    }

    private static async generateAccessAndRefreshTokensRes(user: User, app: AuthApp, scopeOrRt: string | AuthRefreshToken): Promise<AccessTokenRes & RefreshTokenRes> {
        const rt = typeof scopeOrRt === "string" ? await this.generateRefreshToken(user, app, scopeOrRt) : scopeOrRt;
        const scope = rt.scopes.join(" ");

        return {
            access_token: await this.generateAccessToken(user, app, scope, rt.id),
            token_type: "bearer",
            expires_in: config.auth.token_ttl,
            refresh_token: rt.token!,
        };
    }

    private static async generateAuthCode(user: User, app: AuthApp, scope: string): Promise<AuthCode> {
        const [auth, scopes] = await this.authorizeUserApp(user, app, scope);

        const code = new AuthCode();
        code.code = uuid.v4();
        code.scopes = scopes;
        code.auth = auth;

        return code.save();
    }

    private static async generateAccessToken(user: User, app: AuthApp, scope: string, rti?: string): Promise<AccessToken> {
        let aid: string | undefined;
        if (rti == null) {
            const [auth, scopes] = await this.authorizeUserApp(user, app, scope);
            scope = scopes.join(" ");
            aid = auth.id;
        }

        return this.generateJwt({
            jti: uuid.v4(),
            rti,
            aid,
            sub: user.uid,
            appid: app.appid,
            scope
        }, {
            expiresIn: config.auth.token_ttl,
        });
    }

    private static async generateRefreshToken(user: User, app: AuthApp, scope: string): Promise<AuthRefreshToken> {
        const [auth, scopes] = await this.authorizeUserApp(user, app, scope);

        const secret = uuid.v4();

        let rt = new AuthRefreshToken();
        rt.secret = bcrypt.hashSync(secret, 6);
        rt.scopes = scopes;
        rt.auth = auth;

        rt = await rt.save();
        rt.token = Buffer.from(rt.id + ":" + secret).toString("base64");
        return rt;
    }

    public static async generateUrlAccessToken(user: User): Promise<AccessToken> {
        return this.generateJwt({
            jti: uuid.v4(),
            sub: user.uid,
        }, {
            expiresIn: config.auth.url_token_ttl,
        });
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
                    resolve(token!);
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

    private static async revokeAuthCode(code: AuthCode): Promise<void> {
        code.used = true;
        await code.save();
    }

    private static async revokeRefreshToken(rt: AuthRefreshToken): Promise<void> {
        revokedRefreshTokens.push({ id: rt.id, exp: Date.now() + config.auth.token_ttl * 1000 });

        rt.revoked = true;
        await rt.save();
    }

    private static async revokeUserApp(ua: AuthUserApp): Promise<void> {
        revokedUserApps.push({ id: ua.id, exp: Date.now() + config.auth.token_ttl * 1000 });
        ua.revoked = true;
        await ua.save();

        await Promise.all(ua.refresh_tokens.map(this.revokeRefreshToken));
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
