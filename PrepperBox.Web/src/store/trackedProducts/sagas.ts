import { put } from "redux-saga/effects";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { callApi, withCallback, withLoading, withValidatableCallback } from "@hwndmaster/atom-react-redux";
import { type SagaGenerator } from "@hwndmaster/atom-react-redux";
import apiClient from "@/api/apiAxios";
import { convertTrackedProductApiToModel } from "@/api/converters/trackedProductConverters";
import { mapTrackedProductValidationField } from "@/api/fieldMapping/trackedProductFieldMapping";
import LoadingTargets from "@/shared/loadingTargets";
import TrackedProduct from "@/models/trackedProduct";
import * as api from "@/api/api.generated";
import { typedSelect } from "../utils";
import * as trackedProductsActions from "./actions";
import * as trackedProductsActionsInternal from "./actionsInternal";
import { selectTrackedProductById } from "./selectors";

/**
 * Saves the given changes of a tracked product via the API, keeping its other fields, and stores the result.
 * @param existing The tracked product as currently held in the store.
 * @param changes The fields to change.
 */
function* saveTrackedProductChangesSaga(existing: TrackedProduct, changes: Partial<Pick<TrackedProduct, "quantity" | "storageLocationId">>): SagaGenerator {
    const updated: TrackedProduct = { ...existing, ...changes };
    const updateRequest: api.UpdateTrackedProductRequest = {
        id: updated.id,
        lastModified: updated.lastModified,
        productId: updated.productId,
        storageLocationId: updated.storageLocationId,
        expirationDate: updated.expirationDate,
        quantity: updated.quantity,
        notes: updated.notes,
    };
    const updateResult = yield* callApi(() => apiClient().trackedProducts.trackedProductsPUT(updateRequest))
        .invoke();

    if (updateResult == null) {
        throw new Error("API did not return updated tracked product.");
    }

    yield put(trackedProductsActionsInternal.setTrackedProduct({
        ...updated,
        lastModified: updateResult.lastModified,
    }));
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
 * Creates a tracked product via the API.
 * @param action The action containing the tracked product to create.
 */
export function* createTrackedProductSaga(action: ReturnType<typeof trackedProductsActions.createTrackedProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withValidatableCallback(action.meta, { mapValidationField: mapTrackedProductValidationField }, function* () {
            const createRequest: api.CreateTrackedProductRequest = {
                productId: action.payload.productId,
                storageLocationId: action.payload.storageLocationId,
                expirationDate: action.payload.expirationDate,
                quantity: action.payload.quantity,
                notes: action.payload.notes,
            };
            const result = yield* callApi(() => apiClient().trackedProducts.trackedProductsPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created tracked product.");
            }

            const createdTrackedProduct: TrackedProduct = {
                ...action.payload,
                id: result.entityId,
                lastModified: result.lastModified,
                dateCreated: dateToTicks(new Date()),
            };
            yield put(trackedProductsActionsInternal.setTrackedProduct(createdTrackedProduct));

            return result.entityId;
        });
    });
}

/**
 * Updates a tracked product via the API.
 * @param action The action containing the tracked product to update.
 */
export function* updateTrackedProductSaga(action: ReturnType<typeof trackedProductsActions.updateTrackedProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withValidatableCallback(action.meta, { mapValidationField: mapTrackedProductValidationField }, function* () {
            const existing: TrackedProduct | undefined = yield* typedSelect(selectTrackedProductById, action.payload.id);
            if (existing == null) {
                throw new Error(`Cannot update product with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateTrackedProductRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                productId: action.payload.productId,
                storageLocationId: action.payload.storageLocationId,
                expirationDate: action.payload.expirationDate,
                quantity: action.payload.quantity,
                notes: action.payload.notes,
            };
            const result = yield* callApi(() => apiClient().trackedProducts.trackedProductsPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated tracked product.");
            }

            const updatedTrackedProduct: TrackedProduct = {
                ...existing,
                ...action.payload,
                lastModified: result.lastModified,
            };
            yield put(trackedProductsActionsInternal.setTrackedProduct(updatedTrackedProduct));

            return result.entityId;
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

/**
 * Withdraws a quantity from a tracked product by creating a consumption log
 * and either updating or deleting the tracked product.
 * @param action The action containing the tracked product ID and quantity to withdraw.
 */
export function* withdrawTrackedProductSaga(action: ReturnType<typeof trackedProductsActions.withdrawTrackedProduct>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existing: TrackedProduct | undefined = yield* typedSelect(selectTrackedProductById, action.payload.trackedProductId);
            if (existing == null) {
                throw new Error(`Cannot withdraw from tracked product with ID ${String(action.payload.trackedProductId)} because it does not exist in the store.`);
            }

            // Create consumption log
            const consumptionLogResult = yield* callApi(() =>
                apiClient().consumptionLogs.consumptionLogsPOST({
                    productId: existing.productId,
                    quantity: action.payload.quantity,
                    reason: "Withdrawn from stock",
                })
            ).invoke();

            if (consumptionLogResult == null) {
                throw new Error("API did not return created consumption log.");
            }

            // Update or delete tracked product based on remaining quantity
            const newQuantity = existing.quantity - action.payload.quantity;
            if (newQuantity <= 0) {
                yield* callApi(() => apiClient().trackedProducts.trackedProductsDELETE(action.payload.trackedProductId))
                    .invoke();
                yield put(trackedProductsActionsInternal.removeTrackedProductFromStore(action.payload.trackedProductId));
            } else {
                yield* saveTrackedProductChangesSaga(existing, { quantity: newQuantity });
            }
        });
    });
}

/**
 * Moves a tracked product to another storage location via the API.
 * @param action The action containing the tracked product ID and the storage location to move it to.
 */
export function* changeTrackedProductStorageSaga(action: ReturnType<typeof trackedProductsActions.changeTrackedProductStorage>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existing: TrackedProduct | undefined = yield* typedSelect(selectTrackedProductById, action.payload.trackedProductId);
            if (existing == null) {
                throw new Error(`Cannot change the storage of tracked product with ID ${String(action.payload.trackedProductId)} because it does not exist in the store.`);
            }

            yield* saveTrackedProductChangesSaga(existing, { storageLocationId: action.payload.storageLocationId });
        });
    });
}

