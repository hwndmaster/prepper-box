import { put } from "redux-saga/effects";
import apiClient from "@/api/apiAxios";
import { convertTrackedProductApiToModel } from "@/api/converters/trackedProductConverters";
import LoadingTargets from "@/shared/loadingTargets";
import TrackedProduct from "@/models/trackedProduct";
import * as api from "@/api/api.generated";
import { trackedProductRef } from "@/models/types";
import { callApi } from "../apiRequest";
import { SagaGenerator } from "../types";
import { withCallback, withLoading } from "../utils";
import * as trackedProductsActions from "./actions";
import * as trackedProductsActionsInternal from "./actionsInternal";

/**
 * Core logic for saving a tracked product to the API and updating the store.
 */
function* saveTrackedProductCore(trackedProductToSave: TrackedProduct): SagaGenerator {
    const isNewTrackedProduct = trackedProductToSave.id === trackedProductRef.default();

    if (isNewTrackedProduct) {
        const createRequest: api.CreateTrackedProductRequest = {
            productId: trackedProductToSave.productId,
            expirationDate: trackedProductToSave.expirationDate,
            notes: trackedProductToSave.notes,
        };
        const result = yield* callApi(() => apiClient().trackedProducts.trackedProductsPOST(createRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return created tracked product.");
        }

        const createdTrackedProduct: TrackedProduct = {
            ...trackedProductToSave,
            id: result.entityId,
            lastModified: result.lastModified,
        };
        yield put(trackedProductsActionsInternal.setTrackedProduct(createdTrackedProduct));

        return result.entityId;
    } else {
        const updateRequest: api.UpdateTrackedProductRequest = {
            id: trackedProductToSave.id,
            lastModified: trackedProductToSave.lastModified,
            productId: trackedProductToSave.productId,
            expirationDate: trackedProductToSave.expirationDate,
            notes: trackedProductToSave.notes,
        };
        const result = yield* callApi(() => apiClient().trackedProducts.trackedProductsPUT(updateRequest))
            .invoke();

        if (result == null) {
            throw new Error("API did not return updated tracked product.");
        }

        const updatedTrackedProduct: TrackedProduct = {
            ...trackedProductToSave,
            lastModified: result.lastModified,
        };
        yield put(trackedProductsActionsInternal.setTrackedProduct(updatedTrackedProduct));

        return result.entityId;
    }
}

/**
 * Fetches tracked products from the API and updates the store.
 */
export function* fetchTrackedProductsSaga(): Generator<unknown, void, unknown> {
    yield* withLoading(LoadingTargets.TrackedProducts, function* () {
        const trackedProducts: TrackedProduct[] = yield* callApi(() => apiClient().trackedProducts.trackedProductsAll())
            .fetchArray(convertTrackedProductApiToModel);
        yield put(trackedProductsActionsInternal.setTrackedProducts(trackedProducts));
    });
}

/**
 * Saves a tracked product via the API.
 * @param action The action containing the tracked product to save.
 */
export function* saveTrackedProductSaga(action: ReturnType<typeof trackedProductsActions.saveTrackedProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            return yield* saveTrackedProductCore(action.payload);
        });
    });
}

/**
 * Deletes a tracked product via the API.
 * @param action The action containing the ID of the tracked product to delete.
 */
export function* deleteTrackedProductSaga(action: ReturnType<typeof trackedProductsActions.deleteTrackedProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().trackedProducts.trackedProductsDELETE(action.payload))
                .invoke();
            yield put(trackedProductsActionsInternal.removeTrackedProductFromStore(action.payload));
        });
    });
}
