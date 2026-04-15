import { createAction } from "@reduxjs/toolkit";
import { TrackedProductRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";
import { CreateTrackedProductRequest, UpdateTrackedProductRequest } from "./messages";

export interface WithdrawTrackedProductPayload {
    trackedProductId: TrackedProductRef;
    quantity: number;
}

export const fetchTrackedProducts = createAction<void>("trackedProducts/fetch");
export const createTrackedProduct = createActionWithMeta<CreateTrackedProductRequest, TrackedProductRef>("trackedProducts/createTrackedProduct");
export const updateTrackedProduct = createActionWithMeta<UpdateTrackedProductRequest, TrackedProductRef>("trackedProducts/updateTrackedProduct");
export const deleteTrackedProduct = createActionWithMeta<TrackedProductRef>("trackedProducts/deleteTrackedProduct");
export const withdrawTrackedProduct = createActionWithMeta<WithdrawTrackedProductPayload>("trackedProducts/withdrawTrackedProduct");
