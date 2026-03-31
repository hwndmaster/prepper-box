import { createSelector } from "@reduxjs/toolkit";
import { ProductRef } from "@/models/types";
import AppState from "@/store/appState";
import Product from "@/models/product";

export const selectProductById: (state: AppState, productId: ProductRef) => Product | undefined = createSelector(
    [(state: AppState, productId: ProductRef): { products: Product[]; productId: ProductRef } => ({ products: state.products.products, productId })],
    ({ products, productId }) => {
        return products.find((product) => product.id === productId);
    }
);
