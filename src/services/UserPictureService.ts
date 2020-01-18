/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Fri Jan 17 2020
*/

import fs = require("fs");
import sharp = require("sharp");

import { UserPicture } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

const DEFAULT_USER_PICTURE = fs.readFileSync("data/default_user_picture.jpg");

export class UserPictureService extends BaseService {

    public static async getUserPicture(uid: string): Promise<Buffer> {
        const user = await UserService.getUser(uid);
        const pic = await user.picture;
        return pic?.blob || DEFAULT_USER_PICTURE;
    }

    public static async setUserPicture(uid: string, buf: Buffer) {
        const user = await UserService.getUser(uid);

        const pic = await user.picture || new UserPicture();
        try {
            pic.blob = await sharp(buf)
                .resize(300, 300)
                .jpeg()
                .toBuffer();
        } catch (err) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_image", "Bad image file");
        }
        pic.user = Promise.resolve(user);
        return pic.save();
    }

}
