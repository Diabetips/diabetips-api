/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Delete, Get, JsonController, Param, Post, Put } from "routing-controllers";

@JsonController("/v1/users/:uid/notes")
export class UserNoteController {

    private dummy = {
        description: "Dummy note description",
        timestamp: 1581693368,
    };

    @Get("/")
    private async getAllNotes(@Param("uid") uid: string) {
        return [this.dummy];
    }

    @Post("/")
    private async createNote(@Param("uid") uid: string) {
        return this.dummy;
    }

    @Get("/:id")
    private async getNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return this.dummy;
    }

    @Put("/:id")
    private async updateNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return this.dummy;
    }

    @Delete("/:id")
    private async deleteNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        //
    }

}
