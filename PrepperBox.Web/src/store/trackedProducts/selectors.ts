import { createSelector } from "@reduxjs/toolkit";
import { ProductFamilyRef, ProductRef, TrackedProductRef } from "@/models/types";
import AppState from "@/store/appState";
import Product from "@/models/product";
import TrackedProduct from "@/models/trackedProduct";

/** Aggregated stock for a product family: total tracked quantity and the underlying tracked items. */
export interface FamilyStockAggregate {
    count: number;
    trackedProducts: TrackedProduct[];
}

export const selectTrackedProductById: (state: AppState, trackedProductId: TrackedProductRef) => TrackedProduct | undefined = createSelector(
    [(state: AppState, trackedProductId: TrackedProductRef): { trackedProducts: TrackedProduct[]; trackedProductId: TrackedProductRef } => ({ trackedProducts: state.trackedProducts.trackedProducts, trackedProductId })],
    ({ trackedProducts, trackedProductId }) => {
        return trackedProducts.find((tp) => tp.id === trackedProductId);
    }
);

export const selectTrackedProductsByProductId: (state: AppState) => Map<ProductRef, TrackedProduct[]> = createSelector(
    [(state: AppState): TrackedProduct[] => state.trackedProducts.trackedProducts],
    (trackedProducts) => {
        const map = new Map<ProductRef, TrackedProduct[]>();
        for (const tp of trackedProducts) {
            const list = map.get(tp.productId) ?? [];
            list.push(tp);
            map.set(tp.productId, list);
        }
        return map;
    }
);

export const selectTrackedQuantityByProductId: (state: AppState) => Map<ProductRef, number> = createSelector(
    [(state: AppState): TrackedProduct[] => state.trackedProducts.trackedProducts],
    (trackedProducts) => {
        const map = new Map<ProductRef, number>();
        for (const tp of trackedProducts) {
            map.set(tp.productId, (map.get(tp.productId) ?? 0) + tp.quantity);
        }
        return map;
    }
);

export const selectStockAggregatesByFamilyId: (state: AppState) => Map<ProductFamilyRef, FamilyStockAggregate> = createSelector(
    [
        (state: AppState): Product[] => state.products.products,
        selectTrackedQuantityByProductId,
        selectTrackedProductsByProductId,
    ],
    (products, quantityByProductId, trackedByProductId) => {
        const map = new Map<ProductFamilyRef, FamilyStockAggregate>();
        for (const p of products) {
            const entry = map.get(p.familyId) ?? { count: 0, trackedProducts: [] };
            entry.count += quantityByProductId.get(p.id) ?? 0;
            const list = trackedByProductId.get(p.id);
            if (list != null) {
                entry.trackedProducts.push(...list);
            }
            map.set(p.familyId, entry);
        }
        return map;
    }
);
