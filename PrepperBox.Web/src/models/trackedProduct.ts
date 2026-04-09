import { ProductRef, StorageLocationRef, TrackedProductRef } from "./types";

/**
 * Represents a tracked product.
 */
interface TrackedProduct {
    id: TrackedProductRef;
    productId: ProductRef;
    storageLocationId: StorageLocationRef;
    expirationDate?: number;
    quantity: number;
    notes?: string;

    lastModified: number;
    dateCreated: number;
}

export default TrackedProduct;
