import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actionsInternal";
import CategoriesState from "./state";

const initialState: CategoriesState = {
    categories: [],
};

const categoriesReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(actions.setCategories, (state, action) => {
            state.categories = action.payload;
        })
        .addCase(actions.setCategory, (state, action) => {
            const index = state.categories.findIndex((b) => b.id === action.payload.id);
            if (index >= 0) {
                state.categories[index] = action.payload;
            } else {
                state.categories.push(action.payload);
            }
        })
        .addCase(actions.removeCategoryFromStore, (state, action) => {
            state.categories = state.categories.filter((category) => category.id !== action.payload);
        });
});

export default categoriesReducer;
