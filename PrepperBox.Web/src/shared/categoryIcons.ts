const CategoryIconMap: Record<string, string> = {
    food: "fa-solid fa-utensils",
    water: "fa-solid fa-droplet",
    medical: "fa-solid fa-kit-medical",
    cooking: "fa-solid fa-fire-burner",
    cooper: "fa-solid fa-dog",
    other: "fa-solid fa-box",
};

const DefaultCategoryIcon = "fa-solid fa-tag";

/**
 * Gets the icon class for a category.
 */
export function getCategoryIconClass(iconName: string): string {
    return CategoryIconMap[iconName] ?? DefaultCategoryIcon;
}
