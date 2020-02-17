/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import "mocha";
import { getDatabase } from "../src/db";
import { TestFoodCRUD } from "./CRUD/Food.test";
import { TestHba1cCRUD } from "./CRUD/Hba1c.test";
import { TestInsulinCRUD } from "./CRUD/Insulin.test";
import { TestMealCRUD } from "./CRUD/Meal.test";
import { TestRecipeCRUD } from "./CRUD/Recipe.test";
import { TestUserCRUD } from "./CRUD/User.test";

async function main() {
    describe("Services", async () => {
        before(getDatabase);
        TestUserCRUD();

        TestInsulinCRUD();
        TestHba1cCRUD();

        TestFoodCRUD();
        TestRecipeCRUD();
        TestMealCRUD();

        // TestFoodCRUD();
    });
}

main();
