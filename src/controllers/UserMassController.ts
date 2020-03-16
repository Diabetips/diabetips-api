/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Get, JsonController, Param } from "routing-controllers";

@JsonController("/v1/users/:uid/mass")
export class UserMassController {

    private dummy = [
        {
            timestamp: 1581616078,
            mass: 73,
        },
        {
            timestamp: 1581716078,
            mass: 72,
        },
        {
            timestamp: 1581816078,
            mass: 75,
        },
    ];

    @Get("/")
    public async getMassHistory(@Param("uid") uid: string) {
        return this.dummy;
    }

}
