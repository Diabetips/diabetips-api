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
    public total_energy: number;

    @Column({ type: "float" })
    public total_carbohydrates: number;

    @Column({ type: "float" })
    public total_sugars: number;

    @Column({ type: "float" })
    public total_fat: number;

    @Column({ type: "float" })
    public total_saturated_fat: number;

    @Column({ type: "float" })
    public total_fiber: number;

    @Column({ type: "float" })
    public total_proteins: number;

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

    public computeNutritionDataTotals() {
        const originalIngredients = this.recipe.ingredients.map(x => Object.assign(new Ingredient(), x));
        const newIngredients = [];

        this.total_energy = 0;
        this.total_carbohydrates = 0;
        this.total_sugars = 0;
        this.total_fat = 0;
        this.total_saturated_fat = 0;
        this.total_fiber = 0;
        this.total_proteins = 0;

        // Apply all the modifications to a tmp ingredient list
        for (const modif of this.modifications) {
            if (!this.applyIngredientModification(originalIngredients, modif)) {
                newIngredients.push(modif);
            }
        }

        // compute totals of recipe after modifications
        for (const originalIng of originalIngredients) {
            this.total_energy += originalIng.total_energy;
            this.total_carbohydrates += originalIng.total_carbohydrates;
            this.total_sugars += originalIng.total_sugars;
            this.total_fat += originalIng.total_fat;
            this.total_saturated_fat += originalIng.total_saturated_fat;
            this.total_fiber += originalIng.total_fiber;
            this.total_proteins += originalIng.total_proteins;
        }

        // Add new ingredients' total sugar
        for (const newIng of newIngredients) {
            this.total_energy += newIng.total_energy;
            this.total_carbohydrates += newIng.total_carbohydrates;
            this.total_sugars += newIng.total_sugars;
            this.total_fat += newIng.total_fat;
            this.total_saturated_fat += newIng.total_saturated_fat;
            this.total_fiber += newIng.total_fiber;
            this.total_proteins += newIng.total_proteins;
        }

        // compute portions
        const ratio = this.portions_eaten / this.recipe.portions;
        this.total_energy *= ratio;
        this.total_carbohydrates *= ratio;
        this.total_sugars *= ratio;
        this.total_fat *= ratio;
        this.total_saturated_fat *= ratio;
        this.total_fiber *= ratio;
        this.total_proteins *= ratio;
    }

    private applyIngredientModification(originalIngredients: Ingredient[], modif: Ingredient): boolean {
        for (const originalIng of originalIngredients) {
            if (originalIng.food.id === modif.food.id) {
                originalIng.quantity = modif.quantity;
                originalIng.computeNutritionDataTotals();
                return true;
            }
        }
        return false;
    }
}
