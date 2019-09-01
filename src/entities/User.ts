/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Wed Aug 28 2019
*/

import { Column, Entity } from "typeorm";

import { BaseEntity } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {

    @Column({ length: 36, unique: true })
    public uid: string;

    @Column({ length: 200})
    public email: string;

    @Column({ length: 100 })
    public password: string;

    @Column({ length: 100 })
    public first_name: string;

    @Column({ length: 100 })
    public last_name: string;

}
