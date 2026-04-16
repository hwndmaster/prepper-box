import { UnitOfMeasure } from "./unitOfMeasure";

/**
 * Represents a product returned from OpenFoodFacts.
 */
interface OpenFoodFactsProduct {
    barCode: string;
    productName?: string;
    brands?: string;
    quantity?: number;
    unitOfMeasure?: UnitOfMeasure;
    imageUrl?: string;
    imageSmallUrl?: string;
}

export default OpenFoodFactsProduct;
