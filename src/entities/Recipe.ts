/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Sun Sep 08 2019
*/

import { Column, Entity, OneToMany, OneToOne, SelectQueryBuilder, ManyToOne, JoinColumn } from "typeorm";

import { Page, Pageable, Utils } from "../lib";
import { RecipeSearchReq } from "../requests";

import { BaseEntity, IBaseQueryOptions } from "./BaseEntity";

import { Ingredient } from "./Ingredient";
import { RecipePicture } from "./RecipePicture";
import { User } from "./User";
export { RecipePicture };

@Entity()
export class Recipe extends BaseEntity {

    @Column({ length: 50 })
    public name: string;

    @Column({ length: 200 })
    public description: string;

    @Column({ type: "float" })
    public total_sugar: number;

    @Column()
    public portions: number;

    @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, { cascade: true })
    public ingredients: Ingredient[];

    @OneToOne(() => RecipePicture, (picture) => picture.recipe)
    public picture: Promise<RecipePicture>;

    @ManyToOne(() => User, (user) => user.recipes, { cascade: true })
    @JoinColumn()
    public author: User | null;

    // Repository functions

    public static async findAll(p: Pageable,
                                s: RecipeSearchReq = {},
                                options: IBaseQueryOptions = {}):
                                Promise<Page<Recipe>> {
        const subq = (sqb: SelectQueryBuilder<Recipe>) => {
            let subqb = sqb.select("recipe.id");

            if (Utils.optionDefault(options.hideDeleted, true)) {
                subqb = subqb.andWhere("recipe.deleted = false");
            }
            if (s.name !== undefined) {
                subqb = subqb.andWhere(`lower(recipe.name) LIKE lower(:name)`, { name: "%" + s.name + "%" });
            }

            return subqb;
        };

        let qb = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.author", "author")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .andWhere((sqb) => "recipe.id IN " + p.limit(subq(sqb.subQuery().from("recipe", "recipe"))).getQuery());

        if (s.author !== undefined) {
            qb = qb.andWhere(`author.uid = :author`, { author: s.author });

        }
        return p.queryWithCountQuery(qb, subq(this.createQueryBuilder("recipe")));
    }

    public static async findById(id: number, options: IBaseQueryOptions = {}): Promise<Recipe | undefined> {
        let qb = this
            .createQueryBuilder("recipe")
            .leftJoinAndSelect("recipe.author", "author")
            .leftJoinAndSelect("recipe.ingredients", "ingredients")
            .leftJoinAndSelect("ingredients.food", "food")
            .where("recipe.id = :id", { id });

        if (Utils.optionDefault(options.hideDeleted, true)) {
            qb = qb.andWhere("recipe.deleted = false");
        }

        return qb.getOne();
    }

}
