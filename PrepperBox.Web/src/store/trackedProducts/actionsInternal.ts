import { createAction } from "@reduxjs/toolkit";
import { TrackedProductRef } from "@/models/types";
import TrackedProduct from "@/models/trackedProduct";

export const setTrackedProduct = createAction<TrackedProduct>("trackedProducts/setTrackedProduct");
export const setTrackedProducts = createAction<TrackedProduct[]>("trackedProducts/setTrackedProducts");
export const removeTrackedProductFromStore = createAction<TrackedProductRef>("trackedProducts/removeTrackedProduct");
