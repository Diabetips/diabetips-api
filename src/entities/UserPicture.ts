/*!
** Copyright 2019 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Mon Dec 16 2019
*/

import { Column, Entity } from "typeorm";

import { BaseEntity } from "./BaseEntity";

@Entity()
export class UserPicture extends BaseEntity {

    @Column()
    public picture: Buffer;

}
