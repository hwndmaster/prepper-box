import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta, createActionWithMetaValidatable } from "@hwndmaster/atom-react-redux";
import { ProductFamilyRef } from "@/models/types";
import type { ProductFamilySchemaData } from "@/schemas/productFamilySchema";
import { CreateProductFamilyRequest, UpdateProductFamilyRequest } from "./messages";

export const fetchProductFamilies = createAction<void>("productFamilies/fetch");
export const createProductFamily = createActionWithMetaValidatable<CreateProductFamilyRequest, ProductFamilyRef, ProductFamilySchemaData>("productFamilies/createProductFamily");
export const updateProductFamily = createActionWithMetaValidatable<UpdateProductFamilyRequest, ProductFamilyRef, ProductFamilySchemaData>("productFamilies/updateProductFamily");
export const deleteProductFamily = createActionWithMeta<ProductFamilyRef>("productFamilies/deleteProductFamily");
