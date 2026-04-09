import * as api from "@/api/api.generated";
import TrackedProduct from "@/models/trackedProduct";

/**
 * Converts an API TrackedProductDto to a TrackedProduct model.
 * @param apiTrackedProduct The TrackedProductDto from the API.
 * @returns The converted TrackedProduct model.
 */
export function convertTrackedProductApiToModel(apiTrackedProduct: api.TrackedProductDto): TrackedProduct {
    return {
        id: apiTrackedProduct.id,
        productId: apiTrackedProduct.productId,
        storageLocationId: apiTrackedProduct.storageLocationId,
        expirationDate: apiTrackedProduct.expirationDate ?? undefined,
        quantity: apiTrackedProduct.quantity,
        notes: apiTrackedProduct.notes ?? undefined,
        lastModified: apiTrackedProduct.lastModified,
        dateCreated: apiTrackedProduct.dateCreated,
    };
}
