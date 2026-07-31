import { selectProductImageUrl } from "./productImage";

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
