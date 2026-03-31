import { createAction } from "@reduxjs/toolkit";
import { CategoryRef } from "@/models/types";
import Category from "@/models/category";

export const setCategory = createAction<Category>("categories/setCategory");
export const setCategories = createAction<Category[]>("categories/setCategories");
export const removeCategoryFromStore = createAction<CategoryRef>("categories/removeCategory");
