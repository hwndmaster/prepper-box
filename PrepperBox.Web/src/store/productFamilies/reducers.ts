import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import ProductFamiliesState from "./state";

const initialState: ProductFamiliesState = {
    productFamilies: [],
};

const productFamiliesReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setProductFamilies, (state, action) => {
            state.productFamilies = action.payload;
        })
        .addCase(actions.setProductFamily, (state, action) => {
            const index = state.productFamilies.findIndex((b) => b.id === action.payload.id);
            if (index >= 0) {
                state.productFamilies[index] = action.payload;
            } else {
                state.productFamilies.push(action.payload);
            }
        })
        .addCase(actions.removeProductFamilyFromStore, (state, action) => {
            state.productFamilies = state.productFamilies.filter((family) => family.id !== action.payload);
        });
});

export default productFamiliesReducer;
