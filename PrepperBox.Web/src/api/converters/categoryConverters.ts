import * as api from "@/api/api.generated";
import Category from "@/models/category";

/**
 * Converts an API CategoryDto to a Category model.
 * @param apiCategory The CategoryDto from the API.
 * @returns The converted Category model.
 */
export function convertCategoryApiToModel(apiCategory: api.CategoryDto): Category {
    return {
        id: apiCategory.id,
        name: apiCategory.name,
        description: apiCategory.description,
        iconName: apiCategory.iconName,
        lastModified: apiCategory.lastModified,
        dateCreated: new Date(apiCategory.dateCreated)
    };
}
