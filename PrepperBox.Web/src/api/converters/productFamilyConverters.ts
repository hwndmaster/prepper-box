import * as api from "@/api/api.generated";
import ProductFamily from "@/models/productFamily";
import { UnitOfMeasure } from "@/models/unitOfMeasure";

/**
 * Converts an API ProductFamilyDto to a ProductFamily model.
 * @param apiProductFamily The ProductFamilyDto from the API.
 * @returns The converted ProductFamily model.
 */
export function convertProductFamilyApiToModel(apiProductFamily: api.ProductFamilyDto): ProductFamily {
    return {
        id: apiProductFamily.id,
        categoryId: apiProductFamily.categoryId,
        name: apiProductFamily.name,
        unitOfMeasure: apiProductFamily.unitOfMeasure as UnitOfMeasure,
        minimumStockLevel: apiProductFamily.minimumStockLevel,
        productsCount: apiProductFamily.productsCount,
        lastModified: apiProductFamily.lastModified,
        dateCreated: apiProductFamily.dateCreated,
    };
}
