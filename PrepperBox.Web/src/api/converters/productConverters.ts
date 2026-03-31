import * as api from "@/api/api.generated";
import Product from "@/models/product";

/**
 * Converts an API ProductDto to a Product model.
 * @param apiProduct The ProductDto from the API.
 * @returns The converted Product model.
 */
export function convertProductApiToModel(apiProduct: api.ProductDto): Product {
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description,
        categoryId: apiProduct.categoryId,
        manufacturer: apiProduct.manufacturer,
        barCode: apiProduct.barCode,
        trackedProductsCount: apiProduct.trackedProductsCount,
        lastModified: apiProduct.lastModified,
        dateCreated: new Date(apiProduct.dateCreated),
    };
}
