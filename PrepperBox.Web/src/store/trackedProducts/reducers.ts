import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import TrackedProductsState from "./state";

const initialState: TrackedProductsState = {
    trackedProducts: [],
};

const trackedProductsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setTrackedProducts, (state, action) => {
            state.trackedProducts = action.payload;
        })
        .addCase(actions.setTrackedProduct, (state, action) => {
            const index = state.trackedProducts.findIndex((tp) => tp.id === action.payload.id);
            if (index >= 0) {
                state.trackedProducts[index] = action.payload;
            } else {
                state.trackedProducts.push(action.payload);
            }
        })
        .addCase(actions.removeTrackedProductFromStore, (state, action) => {
            state.trackedProducts = state.trackedProducts.filter((tp) => tp.id !== action.payload);
        });
});

export default trackedProductsReducer;
