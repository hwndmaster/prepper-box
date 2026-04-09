import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import StorageLocationsState from "./state";

const initialState: StorageLocationsState = {
    storageLocations: [],
};

const storageLocationsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setStorageLocations, (state, action) => {
            state.storageLocations = action.payload;
        })
        .addCase(actions.setStorageLocation, (state, action) => {
            const index = state.storageLocations.findIndex((s) => s.id === action.payload.id);
            if (index >= 0) {
                state.storageLocations[index] = action.payload;
            } else {
                state.storageLocations.push(action.payload);
            }
        })
        .addCase(actions.removeStorageLocationFromStore, (state, action) => {
            state.storageLocations = state.storageLocations.filter((s) => s.id !== action.payload);
        });
});

export default storageLocationsReducer;
