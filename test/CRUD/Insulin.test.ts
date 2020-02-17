/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Feb 16 2020
*/

import { expect } from "chai";
import { Insulin, User } from "../../src/entities";
import { InsulinType } from "../../src/entities/Insulin";
import { InsulinService } from "../../src/services/InsulinService";
import { defaultPageable } from "../Pagination.test";
import { CreateUser } from "./User.test";

const req = {
    timestamp: 1581891283,
    quantity: 1.2,
    description: "this is a description",
    type: InsulinType.VERY_FAST,
};

const updatedType = InsulinType.SLOW;

let user: User;
const IDParams = {userUid: "", insulinId: 1};
export async function TestInsulinCRUD() {
    describe("Insulin service", async () => {
        before(async () => { user = await CreateUser(); IDParams.userUid = user.uid; });

        let insulin: Insulin;

        it("Should create a new insulin measure", async () => {
            insulin = await InsulinService.addInsulin(IDParams.userUid, req);

            expect(insulin.timestamp).to.equal(req.timestamp);
            expect(insulin.quantity).to.equal(req.quantity);
            expect(insulin.type).to.equal(req.type);
            IDParams.insulinId = insulin.id;
        });

        it("Should get the insulin", async () => {
            const result = await InsulinService.getInsulin(IDParams);

            expect(result.timestamp).to.equal(req.timestamp);
            expect(result.quantity).to.equal(req.quantity);
            expect(result.type).to.equal(req.type);
        });

        it("Should update the insulin's type", async () => {
            req.type = updatedType;
            insulin = await InsulinService.updateInsulin(IDParams, req);

            expect(insulin.type).to.equal(req.type);
        });

        it("Should get the updated insulin", async () => {
            const result = await InsulinService.getInsulin(IDParams);

            expect(result.type).to.equal(insulin.type);
        });

        it("Should get the insulin in array", async () => {
            const result = await InsulinService.getAllInsulin(IDParams.userUid, defaultPageable);

            expect(result.body.length).to.equal(1);
            expect(result.body[0].type).to.equal(insulin.type);
        });

        it("Should delete the insulin", async () => {
            await InsulinService.deleteInsulin(IDParams);
            const result = await InsulinService.getAllInsulin(IDParams.userUid, defaultPageable);

            expect(result.body.length).to.equal(0);
        });

        it("Should return the right type of insulin", async () => {
            expect(InsulinService.getEnumFromString("slow")).to.equal(InsulinType.SLOW)
            expect(InsulinService.getEnumFromString("fast")).to.equal(InsulinType.FAST)
            expect(InsulinService.getEnumFromString("very_fast")).to.equal(InsulinType.VERY_FAST)
        });

        it("Should throw an error (invalid insulin type)", async () => {
            expect(() => { InsulinService.getEnumFromString("invalid type"); })
            .to.Throw("Insulin type (invalid type) unrecognized");
        });
    });
}
