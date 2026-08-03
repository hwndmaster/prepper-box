import ProductFamily from "@/models/productFamily";
import { CategoryRef, ProductFamilyRef } from "@/models/types";
import { StockValidationLevel, validateStockLevel } from "./stockValidation";

/** Aggregated stock of a family, as far as the restock check is concerned. */
export interface RestockStockAggregate {
    count: number;
    trackedProducts: { expirationDate?: number }[];
}

/** A family holding less stock than its minimum, together with the numbers behind that verdict. */
export interface RestockEntry {
    family: ProductFamily;
    count: number;
    level: StockValidationLevel;
    reasons: string[];
}

/**
 * Picks the families of a category that hold less stock than their minimum level, most depleted
 * first. Families without any products are included — holding nothing falls short of any minimum,
 * and those are precisely the families the grouped products table cannot show. Families without a
 * minimum are skipped, having no target to fall short of.
 * @param families All known product families.
 * @param aggregates Aggregated stock per family; a family absent from the map holds no stock.
 * @param categoryId The category to report on, or null while none is selected.
 * @returns The understocked families, ordered by how little of their minimum is covered.
 */
export function getFamiliesNeedingRestock(
    families: ProductFamily[],
    aggregates: Map<ProductFamilyRef, RestockStockAggregate>,
    categoryId: CategoryRef | null
): RestockEntry[] {
    if (categoryId == null) {
        return [];
    }

    return families
        .filter((family) => family.categoryId === categoryId && family.minimumStockLevel > 0)
        .map((family) => {
            const aggregate = aggregates.get(family.id) ?? { count: 0, trackedProducts: [] };
            const validation = validateStockLevel(aggregate.count, family.minimumStockLevel, aggregate.trackedProducts);
            return { family, count: aggregate.count, level: validation.level, reasons: validation.reasons };
        })
        .filter((entry) => entry.count < entry.family.minimumStockLevel)
        .sort((a, b) => {
            const coverageDiff = (a.count / a.family.minimumStockLevel) - (b.count / b.family.minimumStockLevel);
            return coverageDiff !== 0 ? coverageDiff : a.family.name.localeCompare(b.family.name);
        });
}
