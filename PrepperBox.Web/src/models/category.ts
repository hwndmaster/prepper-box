import { CategoryRef } from "./types";

/**
 * Represents a category.
 */
interface Category {
    id: CategoryRef;
    name: string;
    description: string;
    iconName: string;
    lastModified: string;
    dateCreated: Date;
}

export default Category;
