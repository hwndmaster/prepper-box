import { buildImageSearchQuery, selectProductImageUrl, selectProductThumbnailUrl } from "./productImage";

describe("selectProductImageUrl", () => {
    it("selectProductImageUrl: prefers the larger image when both are available", () => {
        // Arrange
        const product = { imageUrl: "https://example.com/big.jpg", imageSmallUrl: "https://example.com/small.jpg" };

        // Act
        const result = selectProductImageUrl(product);

        // Assert
        expect(result).toBe("https://example.com/big.jpg");
    });

    it("selectProductImageUrl: falls back to the smaller image when the larger one is missing", () => {
        // Arrange
        const product = { imageSmallUrl: "https://example.com/small.jpg" };

        // Act
        const result = selectProductImageUrl(product);

        // Assert
        expect(result).toBe("https://example.com/small.jpg");
    });

    it("selectProductImageUrl: returns undefined when neither image is available", () => {
        // Arrange
        const product = {};

        // Act
        const result = selectProductImageUrl(product);

        // Assert
        expect(result).toBeUndefined();
    });

    it("selectProductImageUrl: treats a blank larger image as missing and falls back", () => {
        // Arrange
        const product = { imageUrl: "   ", imageSmallUrl: "https://example.com/small.jpg" };

        // Act
        const result = selectProductImageUrl(product);

        // Assert
        expect(result).toBe("https://example.com/small.jpg");
    });

    it("selectProductImageUrl: returns undefined when both images are blank", () => {
        // Arrange
        const product = { imageUrl: "", imageSmallUrl: "   " };

        // Act
        const result = selectProductImageUrl(product);

        // Assert
        expect(result).toBeUndefined();
    });
});

describe("selectProductThumbnailUrl", () => {
    it("selectProductThumbnailUrl: prefers the smaller image when both are available", () => {
        // Arrange
        const product = { imageUrl: "https://example.com/big.jpg", imageSmallUrl: "https://example.com/small.jpg" };

        // Act
        const result = selectProductThumbnailUrl(product);

        // Assert
        expect(result).toBe("https://example.com/small.jpg");
    });

    it("selectProductThumbnailUrl: falls back to the larger image when the smaller one is missing or blank", () => {
        // Arrange, Act, Assert
        expect(selectProductThumbnailUrl({ imageUrl: "https://example.com/big.jpg" })).toBe("https://example.com/big.jpg");
        expect(selectProductThumbnailUrl({ imageUrl: "https://example.com/big.jpg", imageSmallUrl: " " })).toBe("https://example.com/big.jpg");
    });

    it("selectProductThumbnailUrl: returns undefined when neither image is available", () => {
        // Arrange, Act, Assert
        expect(selectProductThumbnailUrl({})).toBeUndefined();
    });
});

describe("buildImageSearchQuery", () => {
    it("buildImageSearchQuery: puts the manufacturer before the product name", () => {
        // Arrange, Act
        const result = buildImageSearchQuery({ manufacturer: " Heinz ", name: "Baked Beans " });

        // Assert
        expect(result).toBe("Heinz Baked Beans");
    });

    it("buildImageSearchQuery: leaves out a manufacturer the name already mentions", () => {
        // Arrange, Act
        const result = buildImageSearchQuery({ manufacturer: "SPA", name: "Spa Reine Natural Mineral Water" });

        // Assert
        expect(result).toBe("Spa Reine Natural Mineral Water");
    });

    it("buildImageSearchQuery: keeps a manufacturer that only appears inside a longer word of the name", () => {
        // Arrange, Act
        const result = buildImageSearchQuery({ manufacturer: "Spa", name: "Spaghetti" });

        // Assert
        expect(result).toBe("Spa Spaghetti");
    });

    it("buildImageSearchQuery: uses whichever part is present", () => {
        // Arrange, Act, Assert
        expect(buildImageSearchQuery({ name: "Candles" })).toBe("Candles");
        expect(buildImageSearchQuery({ manufacturer: "Heinz", name: "" })).toBe("Heinz");
        expect(buildImageSearchQuery({})).toBe("");
    });
});
