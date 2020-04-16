/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Thu Apr 16 2020
*/

import sharp = require("sharp");

import { RecipePicture } from "../entities";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";

import { BaseService } from "./BaseService";
import { RecipeService } from "./RecipeService";

const DEFAULT_RECIPE_PICTURE = sharp("data/default_recipe_picture.svg").jpeg().toBuffer();

export class RecipePictureService extends BaseService {

    public static async getRecipePicture(id: number): Promise<Buffer> {
        const recipe = await RecipeService.getRecipe(id);
        const pic = await recipe.picture;
        return pic?.blob || DEFAULT_RECIPE_PICTURE;
    }

    public static async setRecipePicture(id: number, buf: Buffer) {
        const recipe = await RecipeService.getRecipe(id);

        const pic = await recipe.picture || new RecipePicture();
        try {
            pic.blob = await sharp(buf)
                .resize(400, 400)
                .jpeg()
                .toBuffer();
        } catch (err) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "bad_image", "Bad image file");
        }
        pic.recipe = Promise.resolve(recipe);
        return pic.save();
    }

    public static async removeRecipePicture(id: number) {
        const recipe = await RecipeService.getRecipe(id);

        const pic = await recipe.picture;
        if (pic != null) {
            await RecipePicture.delete(pic.id);
        }
    }

}
