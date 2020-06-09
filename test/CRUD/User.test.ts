/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect, should } from "chai";
import { User } from "../../src/entities";
import { ApiError } from "../../src/errors";
import { HttpStatus } from "../../src/lib";
import { UserService } from "../../src/services/UserService";
import { defaultPageable } from "../Pagination.test";

const req = {
    email: "debeaumont.alex@gmail.com",
    password: "kappa123",
    lang: "fr",
    first_name: "alex",
    last_name: "deb",
};

const updatedFName = "john";
let userSingleton;

export async function CreateUser(): Promise<User> {
    if (userSingleton === undefined) {
        userSingleton = UserService.registerUser(req);
    }
    return userSingleton;
}

export async function TestUserCRUD() {
    describe("User service", async () => {

        let user: User;

        it("Should create a new user", async () => {
            user = await UserService.registerUser(req);

            expect(user.email).to.equal(req.email);
            expect(user.first_name).to.equal(req.first_name);
            expect(user.last_name).to.equal(req.last_name);
        });

        it("Should get the user", async () => {
            const result = await UserService.getUser(user.uid);

            expect(result.email).to.equal(req.email);
            expect(result.first_name).to.equal(req.first_name);
            expect(result.last_name).to.equal(req.last_name);
        });

        it("Should fail to create a new user (email conflict)", async () => {
            // expect(async () => { Promise.resolve(UserService.registerUser(req)); })
            // .to.Throw("Email address already used by another account");
            // TODO: idk how to test that, for some reason it doesn't see the thrown error
        });

        it("Should update the user's first_name", async () => {
            req.first_name = updatedFName;
            user = await UserService.updateUser(user.uid, req);

            expect(user.first_name).to.equal(req.first_name);
        });

        it("Should get the updated user", async () => {
            const result = await UserService.getUser(user.uid);

            expect(result.first_name).to.equal(user.first_name);
        });

        it("Should get the user in array", async () => {
            const result = await UserService.getAllUsers(defaultPageable);

            expect(result.body.length).to.equal(1);
            expect(result.body[0].first_name).to.equal(user.first_name);
        });

        it("Should delete the user", async () => {
            await UserService.deleteUser(user.uid);
            const result = await UserService.getAllUsers(defaultPageable);

            expect(result.body.length).to.equal(0);
        });
    });
}
