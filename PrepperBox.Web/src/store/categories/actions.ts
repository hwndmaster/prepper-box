import { createAction } from "@reduxjs/toolkit";
import { CreateCategoryRequest, UpdateCategoryRequest } from "@/api/api.generated";
import { CategoryRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";

export const fetchCategories = createAction<void>("categories/fetch");
export const createCategory = createActionWithMeta<CreateCategoryRequest, CategoryRef>("categories/createCategory");
export const updateCategory = createActionWithMeta<UpdateCategoryRequest, CategoryRef>("categories/updateCategory");
export const deleteCategory = createActionWithMeta<CategoryRef>("categories/deleteCategory");
