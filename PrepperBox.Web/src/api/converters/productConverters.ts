import * as api from "@/api/api.generated";
import Product from "@/models/product";
import { UnitOfMeasure } from "@/models/unitOfMeasure";

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
        imageUrl: apiProduct.imageUrl,
        imageSmallUrl: apiProduct.imageSmallUrl,
        unitOfMeasure: apiProduct.unitOfMeasure as UnitOfMeasure,
        trackedProductsCount: apiProduct.trackedProductsCount,
        minimumStockLevel: apiProduct.minimumStockLevel,
        lastModified: apiProduct.lastModified,
        dateCreated: apiProduct.dateCreated,
    };
}
