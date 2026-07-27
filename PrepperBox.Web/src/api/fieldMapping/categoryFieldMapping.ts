import type { CategorySchemaData } from "@/schemas/categorySchema";
import { normalizeApiFieldName } from "./helpers";

type CategoryValidationFieldName = Extract<keyof CategorySchemaData, string>;

const categoryValidationFieldMap: Partial<Record<string, CategoryValidationFieldName>> = {
    Name: "name",
    Description: "description",
    IconName: "iconName",
};

/**
 * Maps backend validation field names to category form field names.
 */
export function mapCategoryValidationField(apiFieldName: string): CategoryValidationFieldName | undefined {
    return categoryValidationFieldMap[normalizeApiFieldName(apiFieldName)];
}
