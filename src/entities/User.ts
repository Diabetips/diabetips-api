/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";

import { Page, Pageable, Utils } from "../lib";

import { BaseEntityHiddenId, IBaseQueryOptions } from "./BaseEntityHiddenId";

import { Biometric } from "./Biometric";
import { BloodSugar } from "./BloodSugar";
import { Event } from "./Event";
import { Hba1c } from "./Hba1c";
import { Height } from "./Height";
import { Insulin } from "./Insulin";
import { Mass } from "./Mass";
import { Meal } from "./Meal";
import { Note } from "./Note";
import { Notification } from "./Notification";
import { NotificationFcmToken } from "./NotificationFcmToken";
import { PhysicalActivity } from "./PhysicalActivity";
import { PlanningEvent } from "./PlanningEvent";
import { Prediction } from "./Prediction";
import { PredictionSettings } from "./PredictionSettings";
import { Recipe } from "./Recipe";
import { SensorUsage } from "./SensorUsage";
import { StickyNote } from "./StickyNote";

import { UserConfirmation } from "./UserConfirmation";
import { UserConnection } from "./UserConnection";
import { UserPasswordReset } from "./UserPasswordReset";
import { UserPicture } from "./UserPicture";

export { UserConfirmation, UserConnection, UserPasswordReset, UserPicture };

@Entity()
export class User extends BaseEntityHiddenId {

    @Column({ type: "uuid" })
    public uid: string;

    @Column({ length: 200 })
    @Index()
    public email: string;

    @Column({ name: "password", length: 100, select: false })
    private _password?: string;

    @Column({ name: "extra_scopes", type: "simple-array", default: "" })
    private _extra_scopes: string[];

    @Column({ length: 10 })
    public lang: string;

    @Column({ length: 100 })
    public timezone: string;

    @Column({ length: 100 })
    public first_name: string;

    @Column({ length: 100 })
    public last_name: string;

    @OneToOne(() => UserConfirmation, (confirmation) => confirmation.user)
    public confirmation: Promise<UserConfirmation>;

    @OneToOne(() => UserPicture, (picture) => picture.user)
    public picture: Promise<UserPicture>;

    @OneToMany(() => UserPasswordReset, (pwdRst) => pwdRst.user)
    public password_resets: Promise<UserPasswordReset[]>;

    @OneToMany(() => UserConnection, (c) => c.source)
    public connections: Promise<UserConnection[]>;

    @OneToMany(() => UserConnection, (c) => c.target)
    public reverseConnections: Promise<UserConnection[]>;

    @OneToMany(() => Notification, (n) => n.target)
    public notifications: Promise<Notification[]>;

    @OneToMany(() => NotificationFcmToken, (nt) => nt.user)
    public notificationFcmTokens: Promise<NotificationFcmToken[]>;

    @OneToMany(() => Recipe, (recipe) => recipe.author)
    public recipes: Promise<Recipe[]>;

    @ManyToMany(() => Recipe, {cascade: true})
    @JoinTable({
        name: "user_favorite_recipes",
    })
    public favoriteRecipes: Promise<Recipe[]>;

    @OneToMany(() => Meal, (meal) => meal.user)
    public meals: Promise<Meal[]>;

    @OneToMany(() => PhysicalActivity, (activity) => activity.user)
    public physical_activities: Promise<PhysicalActivity[]>;

    @OneToMany(() => Insulin, (insulin) => insulin.user)
    public insulin: Promise<Insulin[]>;

    @OneToMany(() => Hba1c, (hba1c) => hba1c.user)
    public hba1c: Promise<Hba1c[]>;

    @OneToMany(() => BloodSugar, (blood_sugar) => blood_sugar.user)
    public blood_sugar: Promise<BloodSugar[]>;

    @OneToMany(() => SensorUsage, (sensor_usage) => sensor_usage.user)
    public sensor_usage: Promise<SensorUsage[]>;

    @OneToOne(() => Biometric, (pd) => pd.user)
    public biometric: Promise<Biometric>;

    @OneToMany(() => Height, (h) => h.user)
    public height_history: Promise<Height[]>;

    @OneToMany(() => Mass, (m) => m.user)
    public mass_history: Promise<Mass[]>;

    @OneToMany(() => Note, (note) => note.user)
    public note: Promise<Note[]>;

    @OneToMany(() => Event, (event) => event.user)
    public event: Promise<Event[]>;

    @OneToMany(() => PlanningEvent, (event) => event.owner)
    public owned_events: Promise<Event[]>;

    @OneToMany(() => StickyNote, (sticky_note) => sticky_note.user)
    public sticky_notes: Promise<StickyNote[]>;

    @OneToMany(() => StickyNote, (sticky_note) => sticky_note.patient)
    public patient_sticky_notes: Promise<StickyNote[]>;

    @OneToMany(() => Prediction, (p) => p.user)
    public prediction_history: Promise<Prediction[]>;

    @OneToOne(() => PredictionSettings, (ps) => ps.user)
    public prediction_settings: Promise<PredictionSettings>;

    public get password(): string | undefined {
        return this._password;
    }

    public set password(password: string | undefined) {
        this._password = password;
    }

    public get extra_scopes(): string[] {
        return this._extra_scopes;
    }

    // Repository functions

    public static async findAll(p: Pageable, options: IUserQueryOptions = {}): Promise<Page<User>> {
        let qb = this.createQueryBuilder("user");

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return p.query(qb);
    }

    public static async findByUid(uid: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let qb = this
            .createQueryBuilder("user")
            .where("user.uid = :uid", { uid });

        if (Utils.optionDefault(options.selectPassword, false)) {
            qb = qb.addSelect("user.password", "user_password");
        }
        if (Utils.optionDefault(options.selectNotificationFcmTokens, false)) {
            qb = qb.leftJoinAndSelect("user.notificationFcmTokens", "notificationFcmToken");
        }
        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return qb.getOne();
    }

    public static async hasUid(uid: string, options: IUserQueryOptions = {}): Promise<boolean> {
        return await this.findByUid(uid, options) != null;
    }

    public static async findByEmail(email: string, options: IUserQueryOptions = {}): Promise<User | undefined> {
        let qb = this
            .createQueryBuilder("user")
            .where("lower(user.email) = lower(:email)", { email });

        if (Utils.optionDefault(options.selectPassword, false)) {
            qb = qb.addSelect("user.password", "user_password");
        }
        if (Utils.optionDefault(options.selectConfirmation, false)) {
            qb = qb.leftJoinAndSelect("user.confirmation", "confirmation");
        }
        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return qb.getOne();
    }

    public static async countByEmail(email: string, options: IUserQueryOptions = {}): Promise<number> {
        let qb = this
            .createQueryBuilder("user")
            .where("lower(user.email) = lower(:email)", { email });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("user.deleted = false");
        }

        return qb.getCount();
    }

}

export interface IUserQueryOptions extends IBaseQueryOptions {
    selectPassword?: boolean;
    selectConfirmation?: boolean;
    selectNotificationFcmTokens?: boolean;
}
