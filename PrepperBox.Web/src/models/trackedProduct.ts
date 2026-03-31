import { ProductRef, TrackedProductRef } from "./types";

/**
 * Represents a tracked product.
 */
interface TrackedProduct {
    id: TrackedProductRef;
    productId: ProductRef;
    expirationDate?: Date;
    quantity: number;
    notes?: string;

    lastModified: string;
    dateCreated: Date;
}

export default TrackedProduct;
