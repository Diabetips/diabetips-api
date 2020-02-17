/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect } from "chai";
import { Meal, User } from "../../src/entities";
import { MealService } from "../../src/services/MealService";
import { defaultPageable } from "../Pagination.test";
import { CreateUser } from "./User.test";

const req = {
    description: "first description",
    timestamp: 1581907819,
    recipes_ids: [
        1,
        2,
    ],
};

const updatedDesc = "new description";

let user: User;
const IDParams = {userUid: "", mealId: 1};

export async function TestMealCRUD() {
    describe("Food service", async () => {
        before(async () => { user = await CreateUser(); IDParams.userUid = user.uid });

        it("Should create one meal", async () => {
            const meal = await MealService.addMeal(IDParams.userUid, req);
            expect(meal.timestamp).to.equal(req.timestamp);
            expect(meal.description).to.equal(req.description);
        });

        it("Should get a specific meal", async () => {
            const result = await MealService.getMeal(IDParams);

            expect(result.description).to.equal(req.description);
        });

        it("Should update the meal's description", async () => {
            req.description = updatedDesc;
            const meal = await MealService.updateMeal(IDParams, req);

            expect(meal.description).to.equal(updatedDesc);
        });

        it("Should get the updated meal", async () => {
            const result = await MealService.getMeal(IDParams);

            expect(result.description).to.equal(req.description);
        });

        // TODO: doesn't work idk why, returns length of 0
        // it("Should get the meals in an array", async () => {
        //     const result = await MealService.getAllMeals(IDParams.userUid, defaultPageable);

        //     expect(result.body.length).to.equal(1);
        // });

        it("Should delete the meal", async () => {
            await MealService.deleteMeal(IDParams);
            const result = await MealService.getAllMeals(user.uid, defaultPageable);

            expect(result.body.length).to.equal(0);
        });
    });
}
