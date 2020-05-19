/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Delete, Get, JsonController, Param, Post, Put, QueryParams, Res, Body } from "routing-controllers";
import { Timeable, Pageable } from "../lib";
import { NoteService } from "../services/NoteService";
import { Response } from "express";
import { NoteCreateReq, NoteUpdateReq } from "../requests";

@JsonController("/v1/users/:uid/notes")
export class UserNoteController {

    @Get("/")
    public async getAllNotes(@Param("uid") uid: string,
                             @QueryParams() p: Pageable,
                             @QueryParams() t: Timeable,
                             @Res() res: Response) {
        const page = await NoteService.getAllNotes(uid, p, t);
        return page.send(res);
    }

    @Post("/")
    public async createNote(@Param("uid") uid: string, @Body() body: NoteCreateReq) {
        return NoteService.addNote(uid, body);
    }

    @Get("/:id")
    public async getNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return NoteService.getNote(uid, noteId);
    }

    @Put("/:id")
    public async updateNote(@Param("uid") uid: string,
                            @Param("id") noteId: number,
                            @Body() body: NoteUpdateReq) {
        return NoteService.updateNote(uid, noteId, body);
    }

    @Delete("/:id")
    public async deleteNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        await NoteService.deleteNote(uid, noteId);
    }

}
