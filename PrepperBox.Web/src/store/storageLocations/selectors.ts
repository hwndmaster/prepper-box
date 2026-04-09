import { createSelector } from "@reduxjs/toolkit";
import { StorageLocationRef } from "@/models/types";
import AppState from "@/store/appState";
import StorageLocation from "@/models/storageLocation";

export const selectStorageLocationById: (state: AppState, storageLocationId: StorageLocationRef) => StorageLocation | undefined = createSelector(
    [(state: AppState, storageLocationId: StorageLocationRef): { storageLocations: StorageLocation[]; storageLocationId: StorageLocationRef } => ({ storageLocations: state.storageLocations.storageLocations, storageLocationId })],
    ({ storageLocations, storageLocationId }) => {
        return storageLocations.find((s) => s.id === storageLocationId);
    }
);
