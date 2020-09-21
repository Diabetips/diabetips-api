/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Sep 11 2020
*/

import { BaseService } from "./BaseService";
import { Pageable, Timeable, Page, HttpStatus } from "../lib";
import { ApiError } from "../errors";
import { StickyNote, User } from "../entities";
import { StickyNoteCreateReq, StickyNoteUpdateReq } from "../requests";
import { filterXSS } from "xss";

export class StickyNoteService extends BaseService {
    public static async getAllStickyNotes(uid: string, patientUid: string): Promise<StickyNote[]> {
        return StickyNote.findAll(uid, patientUid);
    }

    public static async getStickyNote(userUid: string, patientUid: string, noteId: number): Promise<StickyNote> {
        const stickyNote = await StickyNote.findById(userUid, patientUid, noteId);
        if (stickyNote === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "sticky_note_not_found", `StickyNote ${noteId} not found`);
        }
        return stickyNote;
    }

    public static async addStickyNote(userUid: string, patientUid: string, req: StickyNoteCreateReq): Promise<StickyNote> {
        // Get the user
        const user = await User.findByUid(userUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${userUid}) not found`);
        }

        // Get the patient
        const patient = await User.findByUid(patientUid);

        if (patient === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${patientUid}) not found`);
        }

        // Add StickyNote
        const stickyNote = new StickyNote();
        stickyNote.title = req.title;
        stickyNote.content = filterXSS(req.content);
        stickyNote.color = req.color;

        const raw = (await StickyNote.findMaxIndex(userUid, patientUid)) ?? {max: 0};
        stickyNote.index = raw.max + 1;

        stickyNote.patient = Promise.resolve(patient);
        stickyNote.user = Promise.resolve(user);

        return stickyNote.save();
    }

    public static async updateStickyNote(userUid: string,
                                         patientUid: string,
                                         noteId: number,
                                         req: StickyNoteUpdateReq):
                                         Promise<StickyNote> {
        const stickyNote = await StickyNote.findById(userUid, patientUid, noteId);

        if (stickyNote === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "sticky_note_not_found", `StickyNote (${noteId}) or User (${userUid}) not found`);
        }

        if (req.title !== undefined) { stickyNote.title = req.title; }
        if (req.content !== undefined) { stickyNote.content = req.content; }
        if (req.color !== undefined) { stickyNote.color = req.color; }
        if (req.index !== undefined) {
            const oldIndex = stickyNote.index;
            const notes = await StickyNote.findAll(userUid, patientUid);
            const min = oldIndex < req.index ? oldIndex : req.index;
            const max = oldIndex < req.index ? req.index : oldIndex;
            const it = oldIndex < req.index ? -1 : 1;

            await Promise.all(notes.map((note) => {
                if (min <= note.index && note.index <= max && note.id !== stickyNote.id) {
                    note.index += it;
                }
                note.save();
            }));
            stickyNote.index = req.index;
        }

        return stickyNote.save();
    }

    public static async deleteStickyNote(userUid: string, patientUid: string, noteId: number) {
        const stickyNote = await StickyNote.findById(userUid, patientUid, noteId);

        if (stickyNote === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "sticky_note_not_found", `StickyNote (${noteId}) or User (${userUid}) not found`);
        }
        stickyNote.deleted = true;
        const notes = await StickyNote.findAll(userUid, patientUid);
        Promise.all(notes.map((note) => {
            if (note.index > stickyNote.index) {
                note.index--;
            }
            note.save();
        }));
        return stickyNote.save();
    }
}
