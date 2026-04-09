import { CategoryRef } from "./types";

/**
 * Represents a category.
 */
interface Category {
    id: CategoryRef;
    name: string;
    description: string | undefined;
    iconName: string;
    lastModified: number;
    dateCreated: number;
}

export default Category;
