import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta, createActionWithMetaValidatable } from "@hwndmaster/atom-react-redux";
import { CategoryRef } from "@/models/types";
import type { CategorySchemaData } from "@/schemas/categorySchema";
import { CreateCategoryRequest, UpdateCategoryRequest } from "./messages";

export const fetchCategories = createAction<void>("categories/fetch");
export const createCategory = createActionWithMetaValidatable<CreateCategoryRequest, CategoryRef, CategorySchemaData>("categories/createCategory");
export const updateCategory = createActionWithMetaValidatable<UpdateCategoryRequest, CategoryRef, CategorySchemaData>("categories/updateCategory");
export const deleteCategory = createActionWithMeta<CategoryRef>("categories/deleteCategory");
