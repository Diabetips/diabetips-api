/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect } from "chai";
import { Food } from "../../src/entities";
import { FoodService } from "../../src/services/FoodService";
import { defaultPageable } from "../Pagination.test";

const names = [
    "test_5",
    "test_10",
    "sugar_20",
    "sugar_50",
    "test_100",
];

const sugars100g = [
    5,
    10,
    20,
    50,
    100,
];

async function CreateFoods() {
    for (let i = 0; i < 5; i++) {
        const f = new Food();
        f.name = names[i];
        f.sugars_100g = sugars100g[i];
        f.unit = "g";
        await f.save();
    }
}

export async function TestFoodCRUD() {
    describe("Food service", async () => {
        before(CreateFoods);

        it("Should get all (5) food items", async () => {
            const result = await FoodService.getAllFood(defaultPageable, {});

            expect(result.body.length).to.equal(5);
        });

        it("Should get 3 items (search name \"test\")", async () => {
            const result = await FoodService.getAllFood(defaultPageable, { name: "test" });

            expect(result.body.length).to.equal(3);
        });

        it("Should get each specific food", async () => {
            for (let i = 0; i < 5; i++) {
                const f = await FoodService.getFood(i + 1);
                expect(f.name).to.equal(names[i]);
                expect(f.sugars_100g).to.equal(sugars100g[i]);
            }
        });
    });
}
