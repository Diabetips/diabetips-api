/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon Aug 31 2020
*/

import { JsonController, Get, Authorized, Param, QueryParams, Post, Body, Put, Delete } from "routing-controllers";
import { Pageable, Timeable } from "../lib";
import { StickyNoteCreateReq, StickyNoteUpdateReq } from "../requests";
import { StickyNoteService } from "../services";

@JsonController("/v1/users/:uid/sticky")
export class UserStickyNoteController {
    @Get("/")
    @Authorized("notes:read")
    public async getAllStickyNotes(@Param("uid") uid: string,
                                   @QueryParams() p: Pageable,
                                   @QueryParams() t: Timeable) {
        return StickyNoteService.getAllStickyNotes(uid, p, t);
    }

    @Post("/")
    @Authorized("notes:write")
    public async createStickyNote(@Param("uid") uid: string, @Body() body: StickyNoteCreateReq) {
        return StickyNoteService.addStickyNote(uid, body);
    }

    @Get("/:id")
    @Authorized("notes:read")
    public async getStickyNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        return StickyNoteService.getStickyNote(uid, noteId);
    }

    @Put("/:id")
    @Authorized("notes:write")
    public async updateStickyNote(@Param("uid") uid: string,
                                  @Param("id") noteId: number,
                                  @Body() body: StickyNoteUpdateReq) {
        return StickyNoteService.updateStickyNote(uid, noteId, body);
    }

    @Delete("/:id")
    @Authorized("notes:write")
    public async deleteStickyNote(@Param("uid") uid: string, @Param("id") noteId: number) {
        await StickyNoteService.deleteStickyNote(uid, noteId);
    }
}