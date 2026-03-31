import { createSelector } from "@reduxjs/toolkit";
import { TrackedProductRef } from "@/models/types";
import AppState from "@/store/appState";
import TrackedProduct from "@/models/trackedProduct";

export const selectTrackedProductById: (state: AppState, trackedProductId: TrackedProductRef) => TrackedProduct | undefined = createSelector(
    [(state: AppState, trackedProductId: TrackedProductRef): { trackedProducts: TrackedProduct[]; trackedProductId: TrackedProductRef } => ({ trackedProducts: state.trackedProducts.trackedProducts, trackedProductId })],
    ({ trackedProducts, trackedProductId }) => {
        return trackedProducts.find((tp) => tp.id === trackedProductId);
    }
);
