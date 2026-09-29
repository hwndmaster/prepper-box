import { dateToTicks } from "@hwndmaster/atom-web-core";
import Product from "@/models/product";
import { productFamilyRef, ProductFamilyRef, productRef, ProductRef } from "@/models/types";
import { createProduct } from "@/utils/tests/testModels";
import { sortProductsByExpiration, sortProductsByFamily } from "./productSorting";

const CannedFishId = productFamilyRef(1);
const PastaId = productFamilyRef(2);
const WaterId = productFamilyRef(3);

function product(id: number, name: string, familyId: ProductFamilyRef): Product {
    return createProduct({ id: productRef(id), name, familyId });
}

function soonestExpirations(entries: [number, string][]): Map<ProductRef, number> {
    return new Map(entries.map(([id, isoDate]) => [productRef(id), dateToTicks(new Date(isoDate))]));
}

function names(products: Product[]): string[] {
    return products.map((p) => p.name);
}

describe("productSorting", () => {
    it("sortProductsByFamily: groups the products by family and orders each family by name", () => {
        // Arrange
        const products = [
            product(1, "Spaghetti", PastaId),
            product(2, "Tuna", CannedFishId),
            product(3, "Penne", PastaId),
            product(4, "Sardines", CannedFishId),
        ];

        // Act
        const result = sortProductsByFamily(products);

        // Assert
        expect(names(result)).toEqual(["Sardines", "Tuna", "Penne", "Spaghetti"]);
    });

    it("sortProductsByExpiration: ranks families by their soonest-expiring product and keeps each family together", () => {
        // Arrange - Tuna outlasts Bottled, yet stays with Sardines, which puts Canned fish second
        const products = [
            product(1, "Tuna", CannedFishId),
            product(2, "Sardines", CannedFishId),
            product(3, "Spaghetti", PastaId),
            product(4, "Bottled", WaterId),
        ];
        const soonest = soonestExpirations([
            [1, "2027-05-01"],
            [2, "2026-10-20"],
            [3, "2026-10-05"],
            [4, "2026-12-01"],
        ]);

        // Act
        const result = sortProductsByExpiration(products, soonest);

        // Assert
        expect(names(result)).toEqual(["Spaghetti", "Sardines", "Tuna", "Bottled"]);
    });

    it("sortProductsByExpiration: orders a family's products soonest first, then the undated ones by name", () => {
        // Arrange
        const products = [
            product(1, "Tuna", CannedFishId),
            product(2, "Mackerel", CannedFishId),
            product(3, "Sardines", CannedFishId),
            product(4, "Anchovies", CannedFishId),
        ];
        const soonest = soonestExpirations([[1, "2026-11-01"], [3, "2026-10-01"]]);

        // Act
        const result = sortProductsByExpiration(products, soonest);

        // Assert
        expect(names(result)).toEqual(["Sardines", "Tuna", "Anchovies", "Mackerel"]);
    });

    it("sortProductsByExpiration: puts families without any dated stock last, in family order", () => {
        // Arrange
        const products = [
            product(1, "Bottled", WaterId),
            product(2, "Tuna", CannedFishId),
            product(3, "Penne", PastaId),
        ];
        const soonest = soonestExpirations([[3, "2026-10-01"]]);

        // Act
        const result = sortProductsByExpiration(products, soonest);

        // Assert
        expect(names(result)).toEqual(["Penne", "Tuna", "Bottled"]);
    });

    it("sortProductsByExpiration: keeps families apart when they share their soonest date", () => {
        // Arrange
        const products = [
            product(1, "Tuna", CannedFishId),
            product(2, "Sardines", CannedFishId),
            product(3, "Penne", PastaId),
            product(4, "Spaghetti", PastaId),
        ];
        const soonest = soonestExpirations([
            [1, "2026-10-01"],
            [2, "2026-12-01"],
            [3, "2026-10-01"],
            [4, "2026-11-01"],
        ]);

        // Act
        const result = sortProductsByExpiration(products, soonest);

        // Assert
        expect(names(result)).toEqual(["Tuna", "Sardines", "Penne", "Spaghetti"]);
    });
});
