/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect } from "chai";
import { Recipe } from "../../src/entities";
import { RecipeService } from "../../src/services/RecipeService";
import { defaultPageable } from "../Pagination.test";

const req_1 = {
    name: "food_25+15=40",
    description: "",
    ingredients: [
        {
            quantity: 50,
            food_id: 4,
        },
        {
            quantity: 15,
            food_id: 5,
        },
    ],
};

const req_2 = {
    name: "food_50+10=60",
    description: "",
    ingredients: [
        {
            quantity: 50,
            food_id: 5,
        },
        {
            quantity: 200,
            food_id: 1,
        },
    ],
};

const updatedName = "40g of sugar";

export async function TestRecipeCRUD() {
    describe("Food service", async () => {

        it("Should create 3 new recipes", async () => {
            let recipe = await RecipeService.createRecipe(req_1);
            expect(recipe.name).to.equal(req_1.name);
            expect(recipe.total_sugar).to.equal(40);

            recipe = await RecipeService.createRecipe(req_2);
            expect(recipe.name).to.equal(req_2.name);
            expect(recipe.total_sugar).to.equal(60);

            recipe = await RecipeService.createRecipe(req_1);
            expect(recipe.name).to.equal(req_1.name);
        });

        it("Should get a specific recipe", async () => {
            const result = await RecipeService.getRecipe(1);

            expect(result.name).to.equal(req_1.name);
        });

        it("Should update the recipe's name", async () => {
            req_1.name = updatedName;
            const recipe = await RecipeService.updateRecipe(3, req_1);

            expect(recipe.name).to.equal(updatedName);
        });

        it("Should get the updated recipe", async () => {
            const result = await RecipeService.getRecipe(3);

            expect(result.name).to.equal(req_1.name);
        });

        it("Should get the recipes in an array", async () => {
            const result = await RecipeService.getAllRecipes(defaultPageable, {});

            expect(result.body.length).to.equal(3);
        });

        it("Should find recipes with \"40\" (2)", async () => {
            const result = await RecipeService.getAllRecipes(defaultPageable, {name: "40"});

            expect(result.body.length).to.equal(2);
        });

        it("Should delete the recipe", async () => {
            await RecipeService.deleteRecipe(3);
            const result = await RecipeService.getAllRecipes(defaultPageable, {});

            expect(result.body.length).to.equal(2);
        });
    });
}
