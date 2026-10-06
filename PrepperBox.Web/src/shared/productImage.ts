/** Minimal shape of anything carrying the two optional product image URLs (Product, OFF suggestion). */
interface ProductImageUrls {
    imageUrl?: string;
    imageSmallUrl?: string;
}

function firstNonBlank(urls: (string | undefined)[]): string | undefined {
    return urls.find((url) => url != null && url.trim() !== "");
}

/**
 * Picks the product image URL to display, preferring the larger image over the smaller one.
 * Blank values are treated as missing.
 * @param product The entity carrying the image URLs.
 * @returns The URL to display, or undefined when neither image is available.
 */
export function selectProductImageUrl(product: ProductImageUrls): string | undefined {
    return firstNonBlank([product.imageUrl, product.imageSmallUrl]);
}

/**
 * Builds the query the product image search starts from: the manufacturer followed by the product name.
 * The manufacturer is left out when the name already mentions it, as names taken from OpenFoodFacts
 * often do ("SPA" + "SPA Reine" would otherwise search for "SPA SPA Reine").
 * @param product The product's manufacturer and name, either of which may be missing.
 * @returns The search query, empty when there is nothing to search for.
 */
export function buildImageSearchQuery(product: { manufacturer?: string; name?: string }): string {
    const manufacturer = product.manufacturer?.trim() ?? "";
    const name = product.name?.trim() ?? "";
    if (manufacturer === "") {
        return name;
    }

    // Whole words only, so that a "Spa" manufacturer still goes in front of "Spaghetti".
    const escapedManufacturer = manufacturer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const doesNameMentionManufacturer = new RegExp(`(?<![\\p{L}\\p{N}])${escapedManufacturer}(?![\\p{L}\\p{N}])`, "iu").test(name);
    return doesNameMentionManufacturer ? name : `${manufacturer} ${name}`.trim();
}

/**
 * Picks the product image URL for small renditions such as list avatars, preferring the smaller image
 * over the larger one. An image picked from the image search comes without a smaller one.
 * Blank values are treated as missing.
 * @param product The entity carrying the image URLs.
 * @returns The URL to display, or undefined when neither image is available.
 */
export function selectProductThumbnailUrl(product: ProductImageUrls): string | undefined {
    return firstNonBlank([product.imageSmallUrl, product.imageUrl]);
}
