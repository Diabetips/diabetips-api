/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Apr 12 2020
*/

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Meal } from ".";
import { IngredientCreateReq } from "../requests";
import { BaseEntityHiddenId } from "./BaseEntityHiddenId";
import { Ingredient } from "./Ingredient";
import { Recipe } from "./Recipe";

@Entity()
export class MealRecipe extends BaseEntityHiddenId {
    @ManyToOne((type) => Recipe)
    @JoinColumn({ name: "recipe_id" })
    public recipe: Recipe;

    @OneToMany((type) => Ingredient, (modification) => modification.meal_recipe, { cascade: true })
    public modifications: Ingredient[];

    @Column({ type: "float" })
    public total_sugar: number;

    @ManyToOne((type) => Meal, (meal) => meal.recipes)
    @JoinColumn({ name: "meal_id" })
    public meal: Promise<Meal>;

    public async addModifications(modifications: IngredientCreateReq[]) {
        for (const modification of modifications) {
            const ing = new Ingredient();
            await ing.init(modification);
            this.modifications.push(ing);
        }
    }

    public computeTotalSugar() {
        this.total_sugar = 0;

        // Add the total sugar of every modification
        for (const modif of this.modifications) {
            this.total_sugar += modif.total_sugar;
        }
        // For each ingredients, add its sugar unless a modification is found
        for (const ing of this.recipe.ingredients) {
            if (!this.isIngredientModified(ing)) {
                this.total_sugar += ing.total_sugar;
            }
        }
    }

    private isIngredientModified(ingredient: Ingredient): boolean {
        for (const modif of this.modifications) {
            if (modif.food.id === ingredient.food.id) {
                return true;
            }
        }
        return false;
    }
}
