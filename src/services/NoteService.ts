/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Mon May 18 2020
*/

import { BaseService } from "./BaseService";
import { Pageable, Timeable, Page, HttpStatus } from "../lib";
import { Note, User } from "../entities";
import { ApiError } from "../errors";
import { NoteCreateReq, NoteUpdateReq } from "../requests";

export class NoteService extends BaseService {
    public static async getAllNotes(uid: string, p: Pageable, t: Timeable): Promise<Page<Note>> {
        return Note.findAll(uid, p, t);
    }

    public static async getNote(userUid: string, noteId: number): Promise<Note> {
        const note = await Note.findById(userUid, noteId);
        if (note === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "note_not_found", `Note ${noteId} not found`);
        }
        return note;
    }

    public static async addNote(userUid: string, req: NoteCreateReq): Promise<Note> {
        // Get the user
        const user = await User.findByUid(userUid);

        if (user === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "user_not_found", `User (${userUid}) not found`);
        }

        // Add Note
        const note = new Note();
        note.timestamp = req.timestamp;
        note.description = req.description;
        note.user = Promise.resolve(user);

        return note.save();
    }

    public static async updateNote(userUid: string, noteId: number, req: NoteUpdateReq): Promise<Note> {
        const note = await Note.findById(userUid, noteId);

        if (note === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "note_not_found", `Note (${noteId}) or User (${userUid}) not found`);
        }

        if (req.description !== undefined) { note.description = req.description; }
        if (req.timestamp !== undefined) { note.timestamp = req.timestamp; }

        return note.save();
    }

    public static async deleteNote(userUid: string, noteId: number) {
        const note = await Note.findById(userUid, noteId);

        if (note === undefined) {
            throw new ApiError(HttpStatus.NOT_FOUND, "note_not_found", `Note (${noteId}) or User (${userUid}) not found`);
        }
        note.deleted = true;
        return note.save();
    }
}
