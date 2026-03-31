import { createAction } from "@reduxjs/toolkit";
import Category from "@/models/category";
import { CategoryRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchCategories = createAction<void>("categories/fetch");
export const saveCategory = createActionWithMeta<Category, CategoryRef>("categories/saveCategory");
export const deleteCategory = createActionWithMeta<CategoryRef>("categories/deleteCategory");
