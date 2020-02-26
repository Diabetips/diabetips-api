/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";

@JsonController("/v1/users/:uid/blood_sugar")
export class UserBloodSugarController {

    private dummy = [
        {
            timestamp: 1581806120,
            value: 57.7,
        },
        {
            timestamp: 1581806180,
            value: 60.8,
        },
        {
            timestamp: 1581806240,
            value: 61.5,
        },
        {
            timestamp: 1581806300,
            value: 63.2,
        },
    ];

    @Get("/")
    private async getAllUserBloodSugar(@Param("uid") uid: string) {
        return this.dummy;
    }

    @Post("/")
    private async addUserBloodSugar(@Param("uid") uid: string) {
        return this.dummy;
    }

    @Get("/last")
    private async getLastUserBloodSugar(@Param("uid") uid: string) {
        return this.dummy[this.dummy.length - 1];
    }

    @Put("/")
    private async updateUserBloodSugar(@Param("uid") uid: string) {
        return this.dummy;
    }

    @Delete("/")
    private async deleteUserBloodSugar(@Param("uid") uid: string) {
        //
    }

}
