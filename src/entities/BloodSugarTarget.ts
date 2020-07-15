/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Jul 15 2020
*/

import { TimeRangeReq } from "../requests";
import { BloodSugar } from ".";
import { Biometric } from "./Biometric";
import { BiometricService } from "../services";
import { ApiError } from "../errors";
import { HttpStatus } from "../lib";
import { Exclude } from "class-transformer";

export enum BloodSugarTargetFormat {
    PERCENTAGE = "percentage",
    TIME = "time"
}

enum GlycemiaState {
    HYPOGLYCEMIA,
    IN_TARGET,
    HYPERGLYCEMIA,
}

export class BloodSugarTarget {
    public start: number;
    public end: number;
    public format: string;

    public hypoglycemia: number = 0;
    public in_target: number = 0;
    public hyperglycemia: number = 0;

    @Exclude()
    private blood_sugars: BloodSugar[];
    @Exclude()
    private biometrics: Biometric;
    @Exclude()
    private current_state: GlycemiaState;
    @Exclude()
    private start_bs: BloodSugar;

    @Exclude()
    private total_hypo: number = 0;
    @Exclude()
    private total_in: number = 0;
    @Exclude()
    private total_hyper: number = 0;

    public async init(uid: string, t: TimeRangeReq, f: string) {
        this.start = t.start;
        this.end = t.end;
        this.format = f;
        this.blood_sugars = await BloodSugar.findAll(uid, t);
        this.biometrics = await BiometricService.getUserBiometric(uid);
        this.computeTargets(f);
    }

    private computeTargets(f: string) {
        if (this.blood_sugars.length === 0) {
            return;
        }
        if (this.biometrics.hypoglycemia === null || this.biometrics.hyperglycemia === null) {
            throw new ApiError(HttpStatus.NOT_FOUND,
                               "incomplete_biometrics",
                               "The user's hypoglycemia and hyperglycemia thresholds must be set in their biometrics");
        }

        this.start_bs = this.blood_sugars[0];
        this.current_state = this.getGlycemiaState(this.blood_sugars[0]);
        let bs = new BloodSugar();

        for (bs of this.blood_sugars) {
            const new_state = this.getGlycemiaState(bs);
            if (this.current_state !== new_state) {
                this.changeState(new_state, bs);
            }
        }
        this.changeState(this.current_state, bs);

        this.hypoglycemia = this.total_hypo;
        this.in_target = this.total_in;
        this.hyperglycemia = this.total_hyper;
        if (f === BloodSugarTargetFormat.PERCENTAGE) {
            const total_time = this.total_hypo + this.total_in + this.hyperglycemia;
            this.hypoglycemia = this.toPercentage(this.hypoglycemia, total_time);
            this.in_target = this.toPercentage(this.in_target, total_time);
            this.hyperglycemia = this.toPercentage(this.hyperglycemia, total_time);
        }
    }

    private changeState(new_state: GlycemiaState, end: BloodSugar) {
        const diff = this.start_bs.timestamp - end.timestamp;
        switch (this.current_state) {
            case GlycemiaState.HYPOGLYCEMIA:
                this.total_hypo += diff;
                break;
            case GlycemiaState.IN_TARGET:
                this.total_in += diff;
                break;
            case GlycemiaState.HYPERGLYCEMIA:
                this.total_hyper += diff;
                break;
        }
        this.current_state = new_state;
        this.start_bs = end;
    }

    private getGlycemiaState(bs: BloodSugar): GlycemiaState {
        if (this.biometrics.hypoglycemia === null || this.biometrics.hyperglycemia === null) {
            throw new ApiError(HttpStatus.NOT_FOUND,
                               "incomplete_biometrics",
                               "The user's hypoglycemia and hyperglycemia thresholds must be set in their biometrics");
        }
        if (bs.value <= this.biometrics.hypoglycemia) {
            return GlycemiaState.HYPOGLYCEMIA;
        } else if (this.biometrics.hyperglycemia <= bs.value) {
            return GlycemiaState.HYPERGLYCEMIA;
        } else {
            return GlycemiaState.IN_TARGET;
        }
    }

    private toPercentage(value: number, total: number): number {
        return Math.floor(value / total * 100 * 100) / 100;
    }
}