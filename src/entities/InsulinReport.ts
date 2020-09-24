/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Tue Jul 14 2020
*/

import { InsulinCalculationItem } from "./InsulinCalculationItem";
import { TimeRangeReq, InsulinSearchReq } from "../requests";
import { Insulin, InsulinType } from "./Insulin";

export class InsulinReport {
    public start: Date;
    public end: Date;
    public average: InsulinCalculationItem;
    public count: InsulinCalculationItem;

    // coucou arthur
    // Je sais que c'est dégueulasse
    // Mais j'avais *vraiment* la flemme de refaire ça propre
    // Surtout que c'est un peu uen fonctionnalité bricolée en dernière minute
    // et qui sera pas vraiment utilisée
    // Et aussi l'EIP touche bientôt à sa fin, même si c'est que la moitié d'une excuse
    // J'espère que tu me pardonneras
    // Bisou :]
    public async init(uid: string, range: TimeRangeReq, s: InsulinSearchReq) {
        this.start = range.start;
        this.end = range.end;

        const insulins = await Insulin.findAll(uid, range, s);

        this.setAverage(insulins, s);
        this.setCount(insulins, s);
    }

    public setAverage(injections: Insulin[], s: InsulinSearchReq) {
        this.average = new InsulinCalculationItem();
        let slow = 0;
        let slow_count = 0;
        let fast = 0;
        let fast_count = 0;
        let very_fast = 0;
        let very_fast_count = 0;
        for (const ins of injections) {
            switch (ins.type) {
                case InsulinType.SLOW:
                    slow += ins.quantity;
                    slow_count++;
                    break;
                case InsulinType.FAST:
                    fast += ins.quantity;
                    fast_count++;
                    break;
                case InsulinType.VERY_FAST:
                    very_fast += ins.quantity;
                    very_fast_count++;
                    break;
            }
        }
        if (s.types?.includes(InsulinType.SLOW) || s.types === undefined) {
            this.average.slow = slow / (slow_count === 0 ? 1 : slow_count);
        }
        if (s.types?.includes(InsulinType.FAST) || s.types === undefined) {
            this.average.fast = fast / (fast_count === 0 ? 1 : fast_count);
        }
        if (s.types?.includes(InsulinType.VERY_FAST) || s.types === undefined) {
            this.average.very_fast = very_fast / (very_fast_count === 0 ? 1 : very_fast_count);
        }
    }

    public setCount(injections: Insulin[], s: InsulinSearchReq) {
        this.count = new InsulinCalculationItem();
        if (s.types?.includes(InsulinType.SLOW) || s.types === undefined) {
            this.count.slow = 0;
        }
        if (s.types?.includes(InsulinType.FAST) || s.types === undefined) {
            this.count.fast = 0;
        }
        if (s.types?.includes(InsulinType.VERY_FAST) || s.types === undefined) {
            this.count.very_fast = 0;
        }
        for (const ins of injections) {
            switch (ins.type) {
                case InsulinType.SLOW:
                    this.count.slow++;
                    break;
                case InsulinType.FAST:
                    this.count.fast++;
                    break;
                case InsulinType.VERY_FAST:
                    this.count.very_fast++;
                    break;
            }
        }
    }
}