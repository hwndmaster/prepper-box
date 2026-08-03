import ProductFamily from "@/models/productFamily";
import { categoryRef, productFamilyRef, ProductFamilyRef } from "@/models/types";
import { UnitOfMeasure } from "@/models/unitOfMeasure";
import { getFamiliesNeedingRestock, RestockStockAggregate } from "./restockList";
import { StockValidationLevel } from "./stockValidation";

const FoodCategoryId = categoryRef(1);
const WaterCategoryId = categoryRef(2);

function createFamily(id: number, name: string, minimumStockLevel: number, categoryId = FoodCategoryId): ProductFamily {
    return {
        id: productFamilyRef(id),
        categoryId,
        name,
        unitOfMeasure: UnitOfMeasure.Piece,
        minimumStockLevel,
        productsCount: 0,
        lastModified: 0,
        dateCreated: 0,
    };
}

function createAggregates(entries: [number, number][]): Map<ProductFamilyRef, RestockStockAggregate> {
    return new Map(entries.map(([id, count]) => [productFamilyRef(id), { count, trackedProducts: [] }]));
}

describe("restockList", () => {
    it("getFamiliesNeedingRestock: includes families that have no products at all", () => {
        // Arrange - family 1 has no entry in the aggregates, i.e. no products
        const families = [createFamily(1, "Canned fish", 6)];

        // Act
        const result = getFamiliesNeedingRestock(families, createAggregates([]), FoodCategoryId);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].family.name).toBe("Canned fish");
        expect(result[0].count).toBe(0);
        expect(result[0].level).toBe(StockValidationLevel.Danger);
    });

    it("getFamiliesNeedingRestock: keeps families below their minimum and drops those at or above it", () => {
        // Arrange
        const families = [
            createFamily(1, "Below", 6),
            createFamily(2, "Exactly at", 6),
            createFamily(3, "Above", 6),
        ];
        const aggregates = createAggregates([[1, 5], [2, 6], [3, 7]]);

        // Act
        const result = getFamiliesNeedingRestock(families, aggregates, FoodCategoryId);

        // Assert
        expect(result.map((entry) => entry.family.name)).toEqual(["Below"]);
    });

    it("getFamiliesNeedingRestock: skips families without a minimum stock level", () => {
        // Arrange
        const families = [createFamily(1, "No minimum", 0)];

        // Act
        const result = getFamiliesNeedingRestock(families, createAggregates([]), FoodCategoryId);

        // Assert
        expect(result).toEqual([]);
    });

    it("getFamiliesNeedingRestock: supports fractional minimums", () => {
        // Arrange
        const families = [createFamily(1, "Rice", 0.5), createFamily(2, "Flour", 0.5)];
        const aggregates = createAggregates([[1, 0.25], [2, 0.5]]);

        // Act
        const result = getFamiliesNeedingRestock(families, aggregates, FoodCategoryId);

        // Assert
        expect(result.map((entry) => entry.family.name)).toEqual(["Rice"]);
    });

    it("getFamiliesNeedingRestock: orders the most depleted first, then by name", () => {
        // Arrange - "Half" and "Also half" cover the same share of their minimum
        const families = [
            createFamily(1, "Half", 6),
            createFamily(2, "Empty", 6),
            createFamily(3, "Also half", 10),
        ];
        const aggregates = createAggregates([[1, 3], [2, 0], [3, 5]]);

        // Act
        const result = getFamiliesNeedingRestock(families, aggregates, FoodCategoryId);

        // Assert
        expect(result.map((entry) => entry.family.name)).toEqual(["Empty", "Also half", "Half"]);
    });

    it("getFamiliesNeedingRestock: reports only families of the requested category", () => {
        // Arrange
        const families = [
            createFamily(1, "Canned fish", 6),
            createFamily(2, "Bottled water", 6, WaterCategoryId),
        ];

        // Act
        const result = getFamiliesNeedingRestock(families, createAggregates([]), WaterCategoryId);

        // Assert
        expect(result.map((entry) => entry.family.name)).toEqual(["Bottled water"]);
    });

    it("getFamiliesNeedingRestock: reports nothing while no category is selected", () => {
        // Arrange
        const families = [createFamily(1, "Canned fish", 6)];

        // Act
        const result = getFamiliesNeedingRestock(families, createAggregates([]), null);

        // Assert
        expect(result).toEqual([]);
    });
});
