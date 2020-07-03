/*!
** Copyright 2019-2020 Diabetips
**
** All rights reserved
**
** Created by Alexandre DE BEAUMONT on Fri Jul 03 2020
*/

export class MathUtils {
    /**
     * Computes the average value of the list provided
     * @param value A list of numbers
     * @returns Average of the list
     */
    public static getAverage(nbrs: number[]): number {
        let total = 0;

        if (nbrs.length === 0) {
            return 0;
        }
        for (const nbr of nbrs) {
            total += nbr;
        }
        return total / nbrs.length;
    }

    /**
     * Gets the first quartile of the list provided. Considers that the list is sorted by default.
     * @param value A list of numbers
     * @param sort If set to true, the list will be sorted before computation
     * @returns Average of the list
     */
    public static getFirstQuartile(nbrs: number[], sort: boolean = false): number {
        if (nbrs.length === 0) {
            return 0;
        }
        if (sort) {
            nbrs = nbrs.sort();
        }
        const lower = this.getLowerHalf(nbrs);
        return this.getMedian(lower);
    }

    /**
     * Gets the third quartile of the list provided. Considers that the list is sorted by default.
     * @param value A list of numbers
     * @param sort If set to true, the list will be sorted before computation
     * @returns Average of the list
     */
    public static getThirdQuartile(nbrs: number[], sort: boolean = false): number {
        if (nbrs.length === 0) {
            return 0;
        }
        if (sort) {
            nbrs = nbrs.sort();
        }
        const upper = this.getUpperHalf(nbrs);
        return this.getMedian(upper);
    }

    /**
     * Gets the median of the list provided. Considers that the list is sorted by default.
     * @param value A list of numbers
     * @param sort If set to true, the list will be sorted before computation
     * @returns Average of the list
     */
    public static getMedian(nbrs: number[], sort: boolean = false): number {
        if (nbrs.length === 0) {
            return 0;
        }
        if (sort) {
            nbrs = nbrs.sort();
        }
        const half = Math.floor(nbrs.length / 2);

        if (nbrs.length % 2 === 0) {
            return (nbrs[half - 1] + nbrs[half]) / 2;
        } else {
            return nbrs[half];
        }
    }

    private static getLowerHalf(nbrs: number[]): number[] {
        if (nbrs.length === 0) {
            return [];
        }
        return nbrs.slice(0, Math.floor(nbrs.length / 2));
    }

    private static getUpperHalf(nbrs: number[]): number[] {
        if (nbrs.length === 0) {
            return [];
        }
        if (nbrs.length % 2 === 0) {
            return nbrs.slice(Math.floor(nbrs.length / 2), nbrs.length);
        } else {
            return nbrs.slice(Math.floor(nbrs.length / 2) + 1, nbrs.length);
        }
    }
}
