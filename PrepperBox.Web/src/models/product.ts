import { CategoryRef, ProductRef } from "./types";

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

    lastModified: string;
    dateCreated: Date;
}

export default Product;
