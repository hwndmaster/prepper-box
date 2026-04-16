import { createSelector } from "@reduxjs/toolkit";
import { CategoryRef } from "@/models/types";
import AppState from "@/store/appState";
import Category from "@/models/category";

export const selectCategoryById: (state: AppState, categoryId: CategoryRef) => Category | undefined = createSelector(
    [(state: AppState, categoryId: CategoryRef): { categories: Category[]; categoryId: CategoryRef } => ({ categories: state.categories.categories, categoryId })],
    ({ categories, categoryId }) => {
        return categories.find((category) => category.id === categoryId);
    }
);

export const selectCategoryByName: (state: AppState, name: string) => Category | undefined = createSelector(
    [(state: AppState, name: string): { categories: Category[]; name: string } => ({ categories: state.categories.categories, name })],
    ({ categories, name }) => {
        return categories.find((category) => category.name === name);
    }
);
