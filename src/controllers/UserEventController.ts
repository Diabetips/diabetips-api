/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { JsonController, Param } from "routing-controllers";

@JsonController("/v1/users/:uid/events")
export class UserEventController {

    private dummy = {
        description: "Dummy event description",
        start: 1581693368,
        end: 1581696111,
    };

    public async getAllEvents(@Param("uid") uid: string) {
        return [this.dummy];
    }

    public async createEvent(@Param("uid") uid: string) {
        return this.dummy;
    }

    public async getEvent(@Param("uid") uid: string) {
        return this.dummy;
    }

    public async updateEvent(@Param("uid") uid: string) {
        return this.dummy;
    }

    public async deleteEvent(@Param("uid") uid: string) {
        //
    }
}
