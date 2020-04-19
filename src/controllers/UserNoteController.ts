/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Delete, Get, JsonController, Param, Post, Put, QueryParams } from "routing-controllers";
import { Timeable } from "../lib";

@JsonController("/v1/users/:uid/notes")
export class UserNoteController {

    private dummy = {
        description: "Dummy note description",
        timestamp: 1581693368,
    };

    @Get("/")
    public async getAllNotes(@Param("uid") uid: string, @QueryParams() t: Timeable) {
        return [this.dummy];
    }

    @Post("/")
    public async createNote(@Param("uid") uid: string) {
        return this.dummy;
    }

    @Get("/:id")
    public async getNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return this.dummy;
    }

    @Put("/:id")
    public async updateNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return this.dummy;
    }

    @Delete("/:id")
    public async deleteNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        //
    }

}
