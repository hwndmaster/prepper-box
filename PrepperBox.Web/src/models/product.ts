import { CategoryRef, ProductFamilyRef, ProductRef } from "./types";

/**
 * Represents a product.
 */
interface Product {
    id: ProductRef;
    name: string;
    description?: string;
    familyId: ProductFamilyRef;
    /** Derived from the product's family (read-only projection from the API). */
    categoryId: CategoryRef;
    manufacturer?: string;
    barCode?: string;
    imageUrl?: string;
    imageSmallUrl?: string;
    trackedProductsCount: number;

    lastModified: number;
    dateCreated: number;
}

export default Product;
