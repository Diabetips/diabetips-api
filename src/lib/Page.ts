/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jan 26 2020
*/

import { Response } from "express";

import { Pageable } from "./Pageable";

export class Page<T> {

    public size: number;
    public page: number;
    public body: T[];
    public count: number;

    public constructor(p: Pageable, data: [T[], number]) {
        [this.size, this.page] = [p.size, p.page];
        [this.body, this.count] = data;
    }

    /**
     * Sets the X-Page HTTP header on the Response and send it with the results.
     * @param res The Express Response object
     */
    public send(res: Response): T[] {
        const last = Math.ceil(this.count / this.size);
        const prev = this.page - 1;
        const next = this.page + 1;

        let header = prev < 1 ? "" : `previous=${prev}; `;
        header += next > last ? "" : `next=${next}; `;
        header += `last=${last}`;

        res.setHeader("X-Pages", header);
        return this.body;
    }

}
