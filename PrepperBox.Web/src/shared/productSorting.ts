import Product from "@/models/product";
import { ProductFamilyRef, ProductRef } from "@/models/types";

/** Stands in for the expiration of a product without dated stock, so it sorts after every date. */
const NoExpiration = Number.POSITIVE_INFINITY;

function compareExpirations(a: number, b: number): number {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
}

function compareByFamilyThenName(a: Product, b: Product): number {
    if (a.familyId !== b.familyId) {
        return Number(a.familyId) - Number(b.familyId);
    }
    return a.name.localeCompare(b.name);
}

/**
 * Orders products family by family, then by name within each family — the default order of the
 * grouped products table, whose subheader grouping requires each family's rows to be contiguous.
 * @param products The products to order.
 * @returns A new array in family-then-name order.
 */
export function sortProductsByFamily(products: Product[]): Product[] {
    return [...products].sort(compareByFamilyThenName);
}

/**
 * Orders products soonest-expiring first while keeping each family's rows contiguous: families are
 * ranked by their soonest-expiring product, products within a family by their own soonest
 * expiration. Products without dated stock go last within their family, families without any go
 * last overall, and ties fall back to the family-then-name order.
 * @param products The products to order.
 * @param soonestExpirationByProductId The soonest expiration (as ticks) per product; a product
 * absent from the map has no dated stock.
 * @returns A new array in expiration order.
 */
export function sortProductsByExpiration(
    products: Product[],
    soonestExpirationByProductId: Map<ProductRef, number>
): Product[] {
    const expirationOf = (product: Product): number => soonestExpirationByProductId.get(product.id) ?? NoExpiration;

    const familyExpirations = new Map<ProductFamilyRef, number>();
    for (const product of products) {
        const soonest = familyExpirations.get(product.familyId) ?? NoExpiration;
        familyExpirations.set(product.familyId, Math.min(soonest, expirationOf(product)));
    }
    const familyExpirationOf = (product: Product): number => familyExpirations.get(product.familyId) ?? NoExpiration;

    return [...products].sort((a, b) => {
        const byFamilyExpiration = compareExpirations(familyExpirationOf(a), familyExpirationOf(b));
        if (byFamilyExpiration !== 0) {
            return byFamilyExpiration;
        }

        // Families tied on their soonest date must still not interleave.
        if (a.familyId !== b.familyId) {
            return compareByFamilyThenName(a, b);
        }

        const byExpiration = compareExpirations(expirationOf(a), expirationOf(b));
        return byExpiration !== 0 ? byExpiration : compareByFamilyThenName(a, b);
    });
}
