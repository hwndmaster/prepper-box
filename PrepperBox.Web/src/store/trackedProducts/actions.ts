import { createAction } from "@reduxjs/toolkit";
import TrackedProduct from "@/models/trackedProduct";
import { TrackedProductRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchTrackedProducts = createAction<void>("trackedProducts/fetch");
export const saveTrackedProduct = createActionWithMeta<TrackedProduct, TrackedProductRef>("trackedProducts/saveTrackedProduct");
export const deleteTrackedProduct = createActionWithMeta<TrackedProductRef>("trackedProducts/deleteTrackedProduct");
