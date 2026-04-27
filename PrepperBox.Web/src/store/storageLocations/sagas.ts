import { put } from "redux-saga/effects";
import { dateToTicks } from "@hwndmaster/atom-web-core";
import { callApi, withCallback, withLoading } from "@hwndmaster/atom-react-redux";
import { type SagaGenerator } from "@hwndmaster/atom-react-redux";
import * as api from "@/api/api.generated";
import apiClient from "@/api/apiAxios";
import { convertStorageLocationApiToModel } from "@/api/converters/storageLocationConverters";
import LoadingTargets from "@/shared/loadingTargets";
import StorageLocation from "@/models/storageLocation";
import { typedSelect } from "../utils";
import * as storageLocationsActions from "./actions";
import * as storageLocationsActionsInternal from "./actionsInternal";
import { selectStorageLocationById } from "./selectors";

/**
 * Fetches storage locations from the API and updates the store.
 */
export function* fetchStorageLocationsSaga(): SagaGenerator {
    yield* withLoading(LoadingTargets.StorageLocations, function* () {
        const storageLocations: StorageLocation[] = yield* callApi(() => apiClient().storageLocations.storageLocationsAll())
            .fetchArray(convertStorageLocationApiToModel);
        yield put(storageLocationsActionsInternal.setStorageLocations(storageLocations));
    });
}

/**
 * Creates a storage location via the API.
 */
export function* createStorageLocationSaga(action: ReturnType<typeof storageLocationsActions.createStorageLocation>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const createRequest: api.CreateStorageLocationRequest = {
                name: action.payload.name,
            };
            const result = yield* callApi(() => apiClient().storageLocations.storageLocationsPOST(createRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return created storage location.");
            }

            const created: StorageLocation = {
                ...action.payload,
                id: result.entityId,
                lastModified: result.lastModified,
                dateCreated: dateToTicks(new Date()),
            };
            yield put(storageLocationsActionsInternal.setStorageLocation(created));

            return result.entityId;
        });
    });
}

/**
 * Updates a storage location via the API.
 */
export function* updateStorageLocationSaga(action: ReturnType<typeof storageLocationsActions.updateStorageLocation>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            const existingStorageLocation: StorageLocation | undefined = yield* typedSelect(selectStorageLocationById, action.payload.id);
            if (existingStorageLocation == null) {
                throw new Error(`Cannot update storage location with ID ${action.payload.id} because it does not exist in the store.`);
            }

            const updateRequest: api.UpdateStorageLocationRequest = {
                id: action.payload.id,
                lastModified: action.payload.lastModified,
                name: action.payload.name,
            };
            const result = yield* callApi(() => apiClient().storageLocations.storageLocationsPUT(updateRequest))
                .invoke();

            if (result == null) {
                throw new Error("API did not return updated storage location.");
            }

            const updated: StorageLocation = {
                ...existingStorageLocation,
                ...action.payload,
                lastModified: result.lastModified
            };
            yield put(storageLocationsActionsInternal.setStorageLocation(updated));

            return result.entityId;
        });
    });
}

/**
 * Deletes a storage location via the API.
 */
export function* deleteStorageLocationSaga(action: ReturnType<typeof storageLocationsActions.deleteStorageLocation>): SagaGenerator {
    yield* withLoading(LoadingTargets.ActiveView, function* () {
        yield* withCallback(action.meta, function* () {
            yield* callApi(() => apiClient().storageLocations.storageLocationsDELETE(action.payload))
                .invoke();
            yield put(storageLocationsActionsInternal.removeStorageLocationFromStore(action.payload));
        });
    });
}
