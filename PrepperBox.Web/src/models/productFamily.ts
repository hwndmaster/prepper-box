import { CategoryRef, ProductFamilyRef } from "./types";
import { UnitOfMeasure } from "./unitOfMeasure";

/**
 * Represents a product family: a group of products within a category that share a unit of
 * measure and a minimum stock target.
 */
interface ProductFamily {
    id: ProductFamilyRef;
    categoryId: CategoryRef;
    name: string;
    unitOfMeasure: UnitOfMeasure;
    minimumStockLevel: number;
    productsCount: number;
    lastModified: number;
    dateCreated: number;
}

export default ProductFamily;
