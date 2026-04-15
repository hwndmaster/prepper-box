import * as api from "@/api/api.generated";
import OpenFoodFactsProduct from "@/models/openFoodFactsProduct";

/**
 * Converts an OpenFoodFactsProductDto from the API to an OpenFoodFactsProduct model.
 * @param dto The OpenFoodFactsProductDto object from the API.
 * @returns An OpenFoodFactsProduct model object.
 */
export function convertOpenFoodFactsApiToModel(dto: api.OpenFoodFactsProductDto): OpenFoodFactsProduct {
    return {
        barCode: dto.code,
        productName: dto.productName,
        brands: dto.brands,
        categories: dto.categories,
        quantity: dto.quantity,
        unitOfMeasure: dto.unitOfMeasure,
        imageUrl: dto.imageUrl,
        imageSmallUrl: dto.imageSmallUrl
    };
}
