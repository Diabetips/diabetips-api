/*!
** Copyright 2020 Diabetips
**
** All rights reserved
**
** Created by Arthur MELIN on Sun Jan 26 2020
*/

import { SelectQueryBuilder } from "typeorm";

import { config } from "../config";

import { Page } from "./Page";

export class Pageable {

    public size: number;
    public page: number;

    constructor(query: any) {
        function convertToNumber(param: any, defaultValue: number) {
            if (param !== undefined) {
                if (typeof(param) === "string") {
                    param = parseInt(param, 10);
                }
                if (typeof(param) === "number") {
                    return Math.max(param, 1);
                }
            }
            return defaultValue;
        }

        this.size = Math.min(convertToNumber(query.size, config.paging.defaultSize), config.paging.maxSize);
        this.page = convertToNumber(query.page, 1);
    }

    /**
     * Add limit and offset parameters on the given query builder for pagination
     * @param qb The query builder
     */
    public limit<T>(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
        return qb
            .limit(this.size)
            .offset(this.size * (this.page - 1));
    }

    /**
     * Uses this.limit on the given query builder, runs the query and put the result in a Page object
     * @param qb The query builder
     */
    public async query<T>(qb: SelectQueryBuilder<T>): Promise<Page<T>> {
        return new Page(this, await this.limit(qb).getManyAndCount());
    }

    /**
     * Runs the given queries and put the result in a Page object
     * @param qb The query builder
     * This will not limit the results query, this must be done explicitely before
     */
    public async queryWithCountQuery<T>(qb: SelectQueryBuilder<T>, cqb: SelectQueryBuilder<T>): Promise<Page<T>> {
        return new Page(this, await Promise.all([qb.getMany(), cqb.getCount()]));
    }

}
