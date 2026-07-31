/** Minimal shape of anything carrying the two optional product image URLs (Product, OFF suggestion). */
interface ProductImageUrls {
    imageUrl?: string;
    imageSmallUrl?: string;
}

/**
 * Picks the product image URL to display, preferring the larger image over the smaller one.
 * Blank values are treated as missing.
 * @param product The entity carrying the image URLs.
 * @returns The URL to display, or undefined when neither image is available.
 */
export function selectProductImageUrl(product: ProductImageUrls): string | undefined {
    return [product.imageUrl, product.imageSmallUrl]
        .find((url) => url != null && url.trim() !== "");
}
