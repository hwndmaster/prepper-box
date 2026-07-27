import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta, createActionWithMetaValidatable } from "@hwndmaster/atom-react-redux";
import { TrackedProductRef } from "@/models/types";
import type { TrackedProductSchemaData } from "@/schemas/trackedProductSchema";
import { CreateTrackedProductRequest, UpdateTrackedProductRequest } from "./messages";

export interface WithdrawTrackedProductPayload {
    trackedProductId: TrackedProductRef;
    quantity: number;
}

export const fetchTrackedProducts = createAction<void>("trackedProducts/fetch");
export const createTrackedProduct = createActionWithMetaValidatable<CreateTrackedProductRequest, TrackedProductRef, TrackedProductSchemaData>("trackedProducts/createTrackedProduct");
export const updateTrackedProduct = createActionWithMetaValidatable<UpdateTrackedProductRequest, TrackedProductRef, TrackedProductSchemaData>("trackedProducts/updateTrackedProduct");
export const deleteTrackedProduct = createActionWithMeta<TrackedProductRef>("trackedProducts/deleteTrackedProduct");
export const withdrawTrackedProduct = createActionWithMeta<WithdrawTrackedProductPayload>("trackedProducts/withdrawTrackedProduct");
