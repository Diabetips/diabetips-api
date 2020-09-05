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
    @ManyToOne(() => Recipe)
    @JoinColumn()
    public recipe: Recipe;

    @OneToMany(() => Ingredient, (modification) => modification.meal_recipe, { cascade: true })
    public modifications: Ingredient[];

    @Column({ type: "float" })
    public portions_eaten: number;

    @Column({ type: "float" })
    public total_sugar: number;

    @ManyToOne(() => Meal, (meal) => meal.recipes)
    @JoinColumn()
    public meal: Promise<Meal>;

    public async addModifications(modifications: IngredientCreateReq[]) {
        for (const modification of modifications) {
            const ing = new Ingredient();
            await ing.init(modification);
            this.modifications.push(ing);
        }
    }

    public computeTotalSugar() {
        const originalIngredients = this.recipe.ingredients.map(x => Object.assign(new Ingredient(), x));
        const newIngredients = [];
        this.total_sugar = 0;

        // Apply all the modifications to a tmp ingredient list
        for (const modif of this.modifications) {
            if (!this.applyIngredientModification(originalIngredients, modif)) {
                newIngredients.push(modif);
            }
        }

        // compute total sugar of recipe after modifications
        for (const originalIng of originalIngredients) {
            this.total_sugar += originalIng.total_sugar;
        }
        // Add new ingredients' total sugar
        for (const newIng of newIngredients) {
            this.total_sugar += newIng.total_sugar;
        }

        // compute portions
        this.total_sugar *= this.portions_eaten / this.recipe.portions;

    }


    private applyIngredientModification(originalIngredients: Ingredient[], modif: Ingredient): boolean {
        for (const originalIng of originalIngredients) {
            if (originalIng.food.id === modif.food.id) {
                originalIng.quantity = modif.quantity;
                originalIng.computeTotalSugar();
                return true;
            }
        }
        return false;
    }
}
