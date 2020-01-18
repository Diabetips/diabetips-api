/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Jan 17 2020
*/

import sharp = require("sharp");

import { AuthAppLogo } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { AuthAppService } from "./AuthAppService";
import { BaseService } from "./BaseService";

const DEFAULT_APP_LOGO = sharp("data/default_app_logo.svg").png().toBuffer();

export class AuthAppLogoService extends BaseService {

    public static async getAppLogo(appid: string): Promise<Buffer> {
        const app = await AuthAppService.getApp(appid);
        const logo = await app.logo;
        return logo?.blob || DEFAULT_APP_LOGO;
    }

    public static async setAppLogo(appid: string, buf: Buffer) {
        const app = await AuthAppService.getApp(appid);

        const logo = await app.logo || new AuthAppLogo();
        try {
            logo.blob = await sharp(buf)
                .resize(100, 100)
                .png()
                .toBuffer();
        } catch (err) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_image", "Bad image file");
        }
        logo.app = Promise.resolve(app);
        return logo.save();
    }

}
