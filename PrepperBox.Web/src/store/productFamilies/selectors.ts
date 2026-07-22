import { createSelector } from "@reduxjs/toolkit";
import { CategoryRef, ProductFamilyRef } from "@/models/types";
import AppState from "@/store/appState";
import ProductFamily from "@/models/productFamily";

export const selectProductFamilyById: (state: AppState, familyId: ProductFamilyRef) => ProductFamily | undefined = createSelector(
    [(state: AppState, familyId: ProductFamilyRef): { families: ProductFamily[]; familyId: ProductFamilyRef } => ({ families: state.productFamilies.productFamilies, familyId })],
    ({ families, familyId }) => {
        return families.find((family) => family.id === familyId);
    }
);

export const selectProductFamiliesByCategory: (state: AppState, categoryId: CategoryRef) => ProductFamily[] = createSelector(
    [(state: AppState, categoryId: CategoryRef): { families: ProductFamily[]; categoryId: CategoryRef } => ({ families: state.productFamilies.productFamilies, categoryId })],
    ({ families, categoryId }) => {
        return families.filter((family) => family.categoryId === categoryId);
    }
);

export const selectProductFamilyMap: (state: AppState) => Map<ProductFamilyRef, ProductFamily> = createSelector(
    [(state: AppState): ProductFamily[] => state.productFamilies.productFamilies],
    (families) => {
        const map = new Map<ProductFamilyRef, ProductFamily>();
        for (const family of families) {
            map.set(family.id, family);
        }
        return map;
    }
);
