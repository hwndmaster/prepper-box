/**
 * Represents an image found by the product image search.
 */
interface ImageSearchResult {
    /** The full-size image, hosted on the site it was found on. */
    imageUrl: string;
    /** A small preview of the image, hosted by the search provider. Not meant to be stored. */
    thumbnailUrl: string;
    title?: string;
    sourcePageUrl?: string;
    sourceName?: string;
    width?: number;
    height?: number;
}

export default ImageSearchResult;
