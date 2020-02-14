/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Feb 14 2020
*/

import { Request, Response } from "express";
import { HttpStatus } from "../lib";
import { BaseController } from "./BaseController";

export class UserNoteController extends BaseController {

    private static dummy = {
        description: "this is a note's description",
        timestamp: 1581693368,
    };

    constructor() {
        super();

        this.router
        .get("/:userUid/notes",                         this.getAllNotes)
        .post("/:userUid/notes",       this.jsonParser, this.createNote)
        .get("/:userUid/notes/:id",                     this.getNote)
        .put("/:userUid/notes/:id",    this.jsonParser, this.updateNote)
        .delete("/:userUid/notes/:id",                  this.deleteNote);
    }

    private async getAllNotes(req: Request, res: Response) {
        res.send([UserNoteController.dummy]);
    }

    private async createNote(req: Request, res: Response) {
        res.send(UserNoteController.dummy);
    }

    private async getNote(req: Request, res: Response) {
        res.send(UserNoteController.dummy);
    }

    private async updateNote(req: Request, res: Response) {
        res.send(UserNoteController.dummy);
    }

    private async deleteNote(req: Request, res: Response) {
        res
            .status(HttpStatus.NO_CONTENT)
            .send();
    }
}
