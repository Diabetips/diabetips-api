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
    @Get("/:patientUid")
    @Authorized("notes:read")
    public async getAllStickyNotes(@Param("uid") uid: string,
                                   @Param("patientUid") patientUid: string) {
        return StickyNoteService.getAllStickyNotes(uid, patientUid);
    }

    @Post("/:patientUid")
    @Authorized("notes:write")
    public async createStickyNote(@Param("uid") uid: string,
                                  @Param("patientUid") patientUid: string,
                                  @Body() body: StickyNoteCreateReq) {
        return StickyNoteService.addStickyNote(uid, patientUid, body);
    }

    @Get("/:patientUid/:id")
    @Authorized("notes:read")
    public async getStickyNote(@Param("uid") uid: string,
                               @Param("patientUid") patientUid: string,
                               @Param("id") noteId: number) {
        return StickyNoteService.getStickyNote(uid, patientUid, noteId);
    }

    @Put("/:patientUid/:id")
    @Authorized("notes:write")
    public async updateStickyNote(@Param("uid") uid: string,
                                  @Param("patientUid") patientUid: string,
                                  @Param("id") noteId: number,
                                  @Body() body: StickyNoteUpdateReq) {
        return StickyNoteService.updateStickyNote(uid, patientUid, noteId, body);
    }

    @Delete("/:patientUid/:id")
    @Authorized("notes:write")
    public async deleteStickyNote(@Param("uid") uid: string,
                                  @Param("patientUid") patientUid: string,
                                  @Param("id") noteId: number) {
        await StickyNoteService.deleteStickyNote(uid, patientUid, noteId);
    }
}