import { CategoryRef, ProductRef } from "./types";
import { UnitOfMeasure } from "./unitOfMeasure";

/**
 * Represents a product.
 */
interface Product {
    id: ProductRef;
    name: string;
    description?: string;
    categoryId: CategoryRef;
    manufacturer?: string;
    barCode?: string;
    trackedProductsCount: number;
    minimumStockLevel: number;
    unitOfMeasure: UnitOfMeasure;

    lastModified: number;
    dateCreated: number;
}

export default Product;
