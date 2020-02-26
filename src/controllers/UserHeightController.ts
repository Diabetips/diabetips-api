/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Get, JsonController } from "routing-controllers";

@JsonController("/v1/users/:uid/height")
export class UserHeightController {

    private dummy = [
        {
            timestamp: 1581616078,
            height: 173,
        },
        {
            timestamp: 1581716078,
            height: 174,
        },
        {
            timestamp: 1581816078,
            height: 175,
        },
    ];

    @Get("/")
    private async getHeightHistory() {
        return this.dummy;
    }

}
