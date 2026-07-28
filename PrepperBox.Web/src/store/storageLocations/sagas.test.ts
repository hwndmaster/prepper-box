import { Common } from "@hwndmaster/atom-react-redux";
import { SagaRunner } from "@hwndmaster/atom-testing-utils";
import { vi } from "vitest";
import * as api from "@/api/api.generated";
import StorageLocation from "@/models/storageLocation";
import { StorageLocationRef, storageLocationRef } from "@/models/types";
import LoadingTargets from "@/shared/loadingTargets";
import AppState from "@/store/appState";
import { fakeAxios } from "@/utils/tests/fakeAxios";
import * as actions from "./actions";
import * as actionsInternal from "./actionsInternal";
import {
    createStorageLocationSaga,
    deleteStorageLocationSaga,
    fetchStorageLocationsSaga,
    updateStorageLocationSaga,
} from "./sagas";

const sagaRunner = new SagaRunner<AppState>();

const createStorageLocation = (overrides: Partial<StorageLocation> = {}): StorageLocation => ({
    id: storageLocationRef(1),
    name: "Cellar",
    lastModified: 10,
    dateCreated: 1000,
    ...overrides,
});

describe("storageLocations sagas", () => {
    beforeEach(() => {
        fakeAxios.reset();
        sagaRunner.reset();
        sagaRunner.setInitialState({ storageLocations: { storageLocations: [] } });
        vi.clearAllMocks();
    });

    it("fetchStorageLocationsSaga: fetches storage locations and stores them", async () => {
        // Arrange
        const locationDto: api.StorageLocationDto = {
            id: storageLocationRef(1),
            name: "Cellar",
            lastModified: 10,
            dateCreated: 1000,
        };
        fakeAxios.setupGet(api.StorageLocationsClient, "storageLocationsAll")
            .reply(200, [locationDto]);

        // Act
        await sagaRunner.runSaga(fetchStorageLocationsSaga);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.StorageLocations });
        expect(sagaRunner.findDispatchedAction(actionsInternal.setStorageLocations)).toEqual([createStorageLocation()]);
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.StorageLocations });
    });

    it("createStorageLocationSaga: creates a storage location and stores it", async () => {
        // Arrange
        const createRequest: api.CreateStorageLocationRequest = { name: "Garage" };
        fakeAxios.setupPost(api.StorageLocationsClient, "storageLocationsPOST", { body: createRequest })
            .reply(200, { entityId: storageLocationRef(12), lastModified: 30 });
        const resolve = vi.fn<(value?: StorageLocationRef) => void>();
        const action = actions.createStorageLocation(createRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(createStorageLocationSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setStorageLocation)).toEqual({
            name: "Garage",
            id: storageLocationRef(12),
            lastModified: 30,
            dateCreated: expect.any(Number),
        });
        expect(resolve).toHaveBeenCalledWith(storageLocationRef(12));
    });

    it("createStorageLocationSaga: rejects when the API returns no result", async () => {
        // Arrange
        fakeAxios.setupPost(api.StorageLocationsClient, "storageLocationsPOST")
            .reply(200, null);
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.createStorageLocation({ name: "Garage" }, undefined, undefined, reject);

        // Act
        await sagaRunner.runSaga(createStorageLocationSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("API did not return created storage location.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setStorageLocation)).toBeUndefined();
    });

    it("updateStorageLocationSaga: updates an existing storage location", async () => {
        // Arrange
        const existing = createStorageLocation({ id: storageLocationRef(4), lastModified: 6 });
        sagaRunner.setInitialState({ storageLocations: { storageLocations: [existing] } });
        const updateRequest: api.UpdateStorageLocationRequest = {
            id: storageLocationRef(4),
            lastModified: 6,
            name: "Attic",
        };
        fakeAxios.setupPut(api.StorageLocationsClient, "storageLocationsPUT", { body: updateRequest })
            .reply(200, { entityId: storageLocationRef(4), lastModified: 44 });
        const resolve = vi.fn<(value?: StorageLocationRef) => void>();
        const action = actions.updateStorageLocation(updateRequest, undefined, resolve);

        // Act
        await sagaRunner.runSaga(updateStorageLocationSaga, action);

        // Assert
        expect(sagaRunner.findDispatchedAction(actionsInternal.setStorageLocation)).toEqual({
            ...existing,
            name: "Attic",
            lastModified: 44,
        });
        expect(resolve).toHaveBeenCalledWith(storageLocationRef(4));
    });

    it("updateStorageLocationSaga: rejects when the storage location is not in the store", async () => {
        // Arrange
        const reject = vi.fn<(reason?: string) => void>();
        const action = actions.updateStorageLocation(
            { id: storageLocationRef(88), lastModified: 1, name: "Ghost" },
            undefined,
            undefined,
            reject);

        // Act
        await sagaRunner.runSaga(updateStorageLocationSaga, action);

        // Assert
        expect(reject).toHaveBeenCalledWith("Cannot update storage location with ID 88 because it does not exist in the store.");
        expect(sagaRunner.findDispatchedAction(actionsInternal.setStorageLocation)).toBeUndefined();
    });

    it("deleteStorageLocationSaga: deletes the storage location and removes it from the store", async () => {
        // Arrange
        fakeAxios.setupDelete(api.StorageLocationsClient, "storageLocationsDELETE", { id: storageLocationRef(7) })
            .reply(200);
        const action = actions.deleteStorageLocation(storageLocationRef(7));

        // Act
        await sagaRunner.runSaga(deleteStorageLocationSaga, action);

        // Assert
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.showLoader.type, payload: LoadingTargets.ActiveView });
        expect(sagaRunner.findDispatchedAction(actionsInternal.removeStorageLocationFromStore)).toBe(storageLocationRef(7));
        expect(sagaRunner.dispatched).toContainEqual({ type: Common.Actions.hideLoader.type, payload: LoadingTargets.ActiveView });
    });
});
