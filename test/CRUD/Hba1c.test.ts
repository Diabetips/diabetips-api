/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect } from "chai";
import { Hba1c, User } from "../../src/entities";
import { Hba1cService } from "../../src/services/Hba1cService";
import { defaultPageable } from "../Pagination.test";
import { CreateUser } from "./User.test";

const req = {
    timestamp: 1581891283,
    value: 1.2,
    description: "this is a description",
};

const updatedValue = 6.2;

let user: User;
const IDParams = {userUid: "", hba1cId: 1};
export async function TestHba1cCRUD() {
    describe("Hba1c service", async () => {
        before(async () => { user = await CreateUser(); IDParams.userUid = user.uid; });

        let hba1c: Hba1c;

        it("Should create a new hba1c measure", async () => {
            hba1c = await Hba1cService.addHba1c(IDParams.userUid, req);

            expect(hba1c.timestamp).to.equal(req.timestamp);
            expect(hba1c.value).to.equal(req.value);
            IDParams.hba1cId = hba1c.id;
        });

        it("Should get the hba1c", async () => {
            const result = await Hba1cService.getHba1c(IDParams.userUid, IDParams.hba1cId);

            expect(result.timestamp).to.equal(req.timestamp);
            expect(result.value).to.equal(req.value);
        });

        it("Should update the hba1c's type", async () => {
            req.value = updatedValue;
            hba1c = await Hba1cService.updateHba1c(IDParams.userUid, IDParams.hba1cId, req);

            expect(hba1c.value).to.equal(req.value);
        });

        it("Should get the updated hba1c", async () => {
            const result = await Hba1cService.getHba1c(IDParams.userUid, IDParams.hba1cId);

            expect(result.value).to.equal(hba1c.value);
        });

        it("Should get the hba1c in array", async () => {
            const result = await Hba1cService.getAllHba1c(IDParams.userUid, defaultPageable);

            expect(result.body.length).to.equal(1);
            expect(result.body[0].value).to.equal(hba1c.value);
        });

        it("Should delete the hba1c", async () => {
            await Hba1cService.deleteHba1c(IDParams.userUid, IDParams.hba1cId);
            const result = await Hba1cService.getAllHba1c(IDParams.userUid, defaultPageable);

            expect(result.body.length).to.equal(0);
        });
    });
}
