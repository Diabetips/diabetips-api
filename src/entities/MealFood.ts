/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Wed Apr 01 2020
*/

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Food } from ".";
import { BaseEntityHiddenId } from "./BaseEntityHiddenId";
import { Meal } from "./Meal";

@Entity()
export class MealFood extends BaseEntityHiddenId {
    @Column({ type: "float" })
    public quantity: number;

    @Column({ type: "float" })
    public total_sugar: number;

    @ManyToOne((type) => Food)
    @JoinColumn({ name: "food_id" })
    public food: Food;

    @ManyToOne((type) => Meal, (meal) => meal.foods)
    @JoinColumn({ name: "meal_id" })
    public meal: Promise<Meal>;
}
