import { createAction } from "@reduxjs/toolkit";
import { CategoryRef } from "@/models/types";
import { createActionWithMeta } from "../actionExtensions";
import { CreateCategoryRequest, UpdateCategoryRequest } from "./messages";

export const fetchCategories = createAction<void>("categories/fetch");
export const createCategory = createActionWithMeta<CreateCategoryRequest, CategoryRef>("categories/createCategory");
export const updateCategory = createActionWithMeta<UpdateCategoryRequest, CategoryRef>("categories/updateCategory");
export const deleteCategory = createActionWithMeta<CategoryRef>("categories/deleteCategory");
