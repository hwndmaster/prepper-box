import type { ProductFamilySchemaData } from "@/schemas/productFamilySchema";
import { normalizeApiFieldName } from "./helpers";

type ProductFamilyValidationFieldName = Extract<keyof ProductFamilySchemaData, string>;

const productFamilyValidationFieldMap: Partial<Record<string, ProductFamilyValidationFieldName>> = {
    Name: "name",
    UnitOfMeasure: "unitOfMeasure",
    MinimumStockLevel: "minimumStockLevel",
};

/**
 * Maps backend validation field names to product family form field names.
 */
export function mapProductFamilyValidationField(apiFieldName: string): ProductFamilyValidationFieldName | undefined {
    return productFamilyValidationFieldMap[normalizeApiFieldName(apiFieldName)];
}
