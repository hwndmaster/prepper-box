import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import ProductsState from "./state";

const initialState: ProductsState = {
    products: [],
};

const productsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setProducts, (state, action) => {
            state.products = action.payload;
        })
        .addCase(actions.setProduct, (state, action) => {
            const index = state.products.findIndex((p) => p.id === action.payload.id);
            if (index >= 0) {
                state.products[index] = action.payload;
            } else {
                state.products.push(action.payload);
            }
        })
        .addCase(actions.removeProductFromStore, (state, action) => {
            state.products = state.products.filter((product) => product.id !== action.payload);
        });
});

export default productsReducer;
