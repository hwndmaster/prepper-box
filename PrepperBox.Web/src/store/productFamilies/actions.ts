import { createAction } from "@reduxjs/toolkit";
import { createActionWithMeta } from "@hwndmaster/atom-react-redux";
import { ProductFamilyRef } from "@/models/types";
import { CreateProductFamilyRequest, UpdateProductFamilyRequest } from "./messages";

export const fetchProductFamilies = createAction<void>("productFamilies/fetch");
export const createProductFamily = createActionWithMeta<CreateProductFamilyRequest, ProductFamilyRef>("productFamilies/createProductFamily");
export const updateProductFamily = createActionWithMeta<UpdateProductFamilyRequest, ProductFamilyRef>("productFamilies/updateProductFamily");
export const deleteProductFamily = createActionWithMeta<ProductFamilyRef>("productFamilies/deleteProductFamily");
